"""
Verification Test Suite: Timestamp Standardization & Gmail Notification Reliability
Verifies ISO 8601 UTC formatting, preference checks, demo alert suppression,
non-blocking thread execution, and SMTP error handling.
"""

import os
import time
from datetime import datetime, timezone
from app import create_app
from app.config import TestConfig
from app.models import db, User, SecurityAlert, SecurityEvent, Recommendation, FinancialProfile, NotificationPreference
from app.utils.helpers import format_iso_utc
from app.security.notification import dispatch_security_alert
from app.security.email_service import send_recommendation_email

def run_timestamp_and_notification_tests():
    print("=" * 70)
    print("INVESTIQ: TIMESTAMP & NOTIFICATION RELIABILITY TEST SUITE")
    print("=" * 70)

    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()

        # ----------------------------------------------------
        # TEST A: ISO 8601 UTC Timestamp Formatting
        # ----------------------------------------------------
        print("\n[TEST A] Verifying ISO 8601 UTC Timestamp Standardization...")
        now_naive = datetime.utcnow()
        now_utc = datetime.now(timezone.utc)
        
        iso_naive = format_iso_utc(now_naive)
        iso_utc = format_iso_utc(now_utc)
        
        assert iso_naive.endswith('Z'), f"Naive format missing Z suffix: {iso_naive}"
        assert iso_utc.endswith('Z'), f"UTC format missing Z suffix: {iso_utc}"
        assert format_iso_utc(None) is None, "None input should return None"

        # Check model serialization
        u = User(full_name='Timestamp Test User', email='ts.test@investiq.local')
        u.set_password('Pass@1234')
        db.session.add(u)
        db.session.commit()

        event = SecurityEvent(user_id=u.id, event_type='LOGIN', ip_address='127.0.0.1', description='User login event')
        alert = SecurityAlert(user_id=u.id, title='Test Alert', description='Desc', severity='MEDIUM', alert_type='SUSPICIOUS_LOGIN')
        rec = Recommendation(
            user_id=u.id,
            recommended_category='Equity Mutual Funds',
            risk_category='Medium',
            duration_summary='5-7 years',
            confidence_score=88.5,
            explanation='Test',
            _profile_snapshot='{}',
            _alternatives='[]',
            _key_considerations='[]'
        )
        prof = FinancialProfile(user_id=u.id, age=30, monthly_income=50000, current_savings=200000, planned_investment=10000, investment_duration=5, risk_tolerance='Medium', financial_goal='Wealth Creation')

        db.session.add_all([event, alert, rec, prof])
        db.session.commit()

        assert u.to_dict()['created_at'].endswith('Z'), "User created_at missing Z"
        assert event.to_dict()['created_at'].endswith('Z'), "SecurityEvent created_at missing Z"
        assert alert.to_dict()['created_at'].endswith('Z'), "SecurityAlert created_at missing Z"
        assert rec.to_dict()['created_at'].endswith('Z'), "Recommendation created_at missing Z"
        assert prof.to_dict()['updated_at'].endswith('Z'), "UserProfile updated_at missing Z"

        print("  -> PASSED: All model .to_dict() methods output explicit ISO 8601 UTC 'Z' timestamps.")

        # ----------------------------------------------------
        # TEST B: Simulated Demo Alert Email Suppression
        # ----------------------------------------------------
        print("\n[TEST B] Verifying Simulated Demo Alert Email Suppression...")
        sim_alert = SecurityAlert(
            user_id=u.id,
            title='Simulated Alert',
            description='Demo test alert',
            severity='HIGH',
            alert_type='SIMULATED_TEST',
            is_simulated=True
        )
        db.session.add(sim_alert)
        db.session.commit()

        result = dispatch_security_alert(sim_alert, user=u)
        assert result is False, "Simulated alert should return False (email skipped)"
        assert sim_alert.email_dispatch_status == 'SKIPPED_SIMULATED', f"Expected SKIPPED_SIMULATED, got {sim_alert.email_dispatch_status}"
        assert sim_alert.delivered_email is False
        print("  -> PASSED: Simulated alert email suppressed with SKIPPED_SIMULATED status.")

        # ----------------------------------------------------
        # TEST C: Notification Preferences & Severity Threshold
        # ----------------------------------------------------
        print("\n[TEST C] Verifying User Notification Preferences & Severity Thresholds...")
        # C1: Disabled Email Alerts
        u_pref_disabled = User(full_name='Pref Disabled', email='pref.disabled@investiq.local')
        u_pref_disabled.set_password('Pass@1234')
        db.session.add(u_pref_disabled)
        db.session.commit()

        pref_off = NotificationPreference(user_id=u_pref_disabled.id, email_alerts_enabled=False)
        db.session.add(pref_off)
        db.session.commit()

        real_alert1 = SecurityAlert(user_id=u_pref_disabled.id, title='Real Alert 1', description='Desc', severity='HIGH', alert_type='REAL_1', is_simulated=False)
        db.session.add(real_alert1)
        db.session.commit()

        res_pref1 = dispatch_security_alert(real_alert1, user=u_pref_disabled)
        assert res_pref1 is False
        assert real_alert1.email_dispatch_status == 'SKIPPED_PREFERENCE'
        print("  -> Subtest C1 Passed: Email disabled in preferences -> SKIPPED_PREFERENCE.")

        # C2: Severity Threshold Filtering (High threshold vs Medium alert)
        u_pref_high = User(full_name='Pref High Threshold', email='pref.high@investiq.local')
        u_pref_high.set_password('Pass@1234')
        db.session.add(u_pref_high)
        db.session.commit()

        pref_high = NotificationPreference(user_id=u_pref_high.id, email_alerts_enabled=True, alert_severity_threshold='HIGH')
        db.session.add(pref_high)
        db.session.commit()

        med_alert = SecurityAlert(user_id=u_pref_high.id, title='Medium Alert', description='Desc', severity='MEDIUM', alert_type='REAL_MED', is_simulated=False)
        db.session.add(med_alert)
        db.session.commit()

        res_pref2 = dispatch_security_alert(med_alert, user=u_pref_high)
        assert res_pref2 is False
        assert med_alert.email_dispatch_status == 'SKIPPED_PREFERENCE'
        print("  -> Subtest C2 Passed: Medium alert below High threshold -> SKIPPED_PREFERENCE.")

        # ----------------------------------------------------
        # TEST D: Non-blocking Async Thread Error Resilience
        # ----------------------------------------------------
        print("\n[TEST D] Verifying Non-Blocking Background Thread Error Handling...")
        app.config['SMTP_SERVER'] = 'invalid.smtp.domain.local'
        app.config['SMTP_PORT'] = 587
        app.config['SMTP_USERNAME'] = 'test@gmail.com'
        app.config['SMTP_PASSWORD'] = 'fake_pass_123'

        high_alert = SecurityAlert(
            user_id=u_pref_high.id,
            title='Critical Threat Alert',
            description='Should trigger background dispatch',
            severity='HIGH',
            alert_type='CRITICAL_TEST',
            is_simulated=False
        )
        db.session.add(high_alert)
        db.session.commit()

        # Call dispatch - should return True immediately without raising exception
        start_time = time.time()
        res_async = dispatch_security_alert(high_alert, user=u_pref_high)
        elapsed = time.time() - start_time

        assert res_async is True, "Async dispatch should return True"
        assert elapsed < 0.5, f"Dispatch blocked main thread for {elapsed:.2f} seconds!"

        # Wait briefly for background thread to encounter invalid SMTP connection
        time.sleep(1.0)

        # Expire session so main thread reloads updated record from shared DB
        db.session.expire_all()

        # Check that DB was updated asynchronously to FAILED
        updated_alert = db.session.get(SecurityAlert, high_alert.id)
        assert updated_alert.email_dispatch_status == 'FAILED', f"Expected FAILED, got {updated_alert.email_dispatch_status}"
        assert updated_alert.delivered_email is False
        print("  -> PASSED: Dispatch executed asynchronously (<0.5s), handled SMTP failure gracefully without crashing app.")

        # ----------------------------------------------------
        # TEST E: Recommendation Email Service Invocation
        # ----------------------------------------------------
        print("\n[TEST E] Verifying Recommendation Email Service Integration...")
        rec_data = {
            'recommended_category': 'Balanced Growth Portfolio',
            'risk_level': 'Moderate',
            'duration_summary': '3-5 years',
            'confidence_score': 92.0,
            'explanation': 'Optimal risk-reward balance based on cashflow analysis.',
            'alternatives': [{'category': 'Debt Mutual Funds', 'confidence': 80.0}]
        }
        rec_sent = send_recommendation_email(u_pref_high, rec_data)
        assert rec_sent is True, "send_recommendation_email should queue dispatch thread"
        print("  -> PASSED: Recommendation email function dispatched successfully.")

        print("\n" + "=" * 70)
        print("ALL TIMESTAMP & NOTIFICATION RELIABILITY TESTS PASSED (100%)")
        print("=" * 70)

if __name__ == '__main__':
    run_timestamp_and_notification_tests()
