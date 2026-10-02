import uuid
from flask import request, has_request_context
from ..models import db, SecurityEvent, SecurityAlert, User
from ..utils.helpers import get_client_ip, parse_user_agent
from .notification import dispatch_security_alert

def log_security_event(
    event_type,
    description,
    severity='LOW',
    user_id=None,
    detection_status='DETECTED',
    response_action='ALLOW',
    is_simulated=False,
    create_alert=False,
    alert_title=None
):
    """
    Records a security event in the database, extracts network telemetry,
    and creates a security alert if severity is HIGH/CRITICAL or create_alert=True.
    """
    ip_addr = '127.0.0.1'
    browser = 'System Client'
    os_name = 'System Server'
    raw_ua = 'N/A'
    endpoint = 'N/A'
    method = 'INTERNAL'

    if has_request_context():
        ip_addr = get_client_ip()
        ua_info = parse_user_agent()
        browser = ua_info['browser']
        os_name = ua_info['os']
        raw_ua = ua_info['raw_ua']
        endpoint = request.path
        method = request.method

    event_id = str(uuid.uuid4())
    should_alert = create_alert or severity in ['HIGH', 'CRITICAL']
    alert_status = 'PENDING' if should_alert else 'NONE'

    event = SecurityEvent(
        id=event_id,
        event_type=event_type,
        user_id=user_id,
        severity=severity,
        description=description,
        ip_address=ip_addr,
        browser=browser,
        os=os_name,
        user_agent_raw=raw_ua,
        endpoint=endpoint,
        method=method,
        detection_status=detection_status,
        response_action=response_action,
        alert_status=alert_status,
        is_simulated=is_simulated
    )
    db.session.add(event)

    alert = None
    if should_alert:
        title = alert_title or f"Security Alert: {event_type.replace('_', ' ').title()}"
        alert = SecurityAlert(
            id=str(uuid.uuid4()),
            event_id=event_id,
            user_id=user_id,
            alert_type=event_type,
            title=title,
            description=description,
            severity=severity,
            status='PENDING',
            delivered_in_app=True,
            is_simulated=is_simulated
        )
        db.session.add(alert)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Fallback logging if DB error
        print(f"[SECURITY EVENT LOGGER ERROR] Failed to save security event: {e}")
        return None

    if alert:
        user = db.session.get(User, user_id) if user_id else None
        dispatch_security_alert(alert, user=user)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()

    return event
