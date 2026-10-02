import time
from datetime import datetime, timedelta
from flask import current_app, request
from .event_logger import log_security_event

class ThreatDetector:
    # Memory tracker for failed logins: {identifier (ip or email): [timestamp1, timestamp2, ...]}
    _failed_attempts = {}

    @classmethod
    def record_failed_login(cls, identifier, user_id=None, email=None):
        """
        Tracks a failed login attempt and flags repeated failures.
        Returns a tuple: (is_flagged: bool, current_attempts: int, message: str)
        """
        now = time.time()
        window_sec = current_app.config.get('FAILED_LOGIN_WINDOW_MINUTES', 5) * 60
        threshold = current_app.config.get('FAILED_LOGIN_LIMIT', 3)

        if identifier not in cls._failed_attempts:
            cls._failed_attempts[identifier] = []

        # Filter attempts within current window
        cls._failed_attempts[identifier] = [
            t for t in cls._failed_attempts[identifier] if (now - t) <= window_sec
        ]

        cls._failed_attempts[identifier].append(now)
        attempts_count = len(cls._failed_attempts[identifier])

        # Always log the failed login event
        log_security_event(
            event_type='FAILED_LOGIN',
            description=f"Failed login attempt #{attempts_count} for account/target '{email or identifier}'.",
            severity='LOW' if attempts_count < threshold else 'HIGH',
            user_id=user_id,
            response_action='DENIED',
            create_alert=(attempts_count >= threshold),
            alert_title=f"Multiple Failed Login Attempts Detected ({attempts_count})"
        )

        if attempts_count >= threshold:
            # Trigger high priority security alert
            log_security_event(
                event_type='SUSPICIOUS_LOGIN_ATTEMPT',
                description=(
                    f"Suspicious repeated authentication failure: {attempts_count} failed logins "
                    f"within {current_app.config.get('FAILED_LOGIN_WINDOW_MINUTES', 5)} minutes "
                    f"from source '{identifier}' targeting '{email or 'unknown'}'. Possible brute-force attack."
                ),
                severity='HIGH',
                user_id=user_id,
                response_action='ALERT_GENERATED',
                create_alert=True,
                alert_title="Suspicious Login Pattern: Potential Brute-Force"
            )
            return True, attempts_count, "Multiple failed login attempts detected. Security alert generated."

        return False, attempts_count, "Invalid credentials."

    @classmethod
    def clear_failed_attempts(cls, identifier):
        """Clears failed login attempts for an identifier after successful login."""
        if identifier in cls._failed_attempts:
            del cls._failed_attempts[identifier]

    @classmethod
    def check_malformed_input(cls, payload):
        """
        Checks input payload for obvious injection artifacts or malformed characters.
        Returns True if suspicious pattern is detected.
        """
        if not isinstance(payload, dict):
            return False

        suspicious_patterns = [
            '<script', '</script>', 'javascript:',
            'union select', 'exec(', 'drop table',
            '1=1', '--', '/*', '*/', 'sleep('
        ]

        for key, value in payload.items():
            str_val = str(value).lower()
            for pattern in suspicious_patterns:
                if pattern in str_val:
                    log_security_event(
                        event_type='MALFORMED_REQUEST',
                        description=f"Malformed input or potential injection payload detected in field '{key}'. Pattern: '{pattern}'.",
                        severity='HIGH',
                        response_action='DENIED',
                        create_alert=True,
                        alert_title="Potential Injection / Malformed Request Blocked"
                    )
                    return True
        return False
