"""
Debug script to run simulate-event against the REAL database (Config, not TestConfig)
and print any DB exception stack trace.
"""

from app import create_app
from app.config import Config
from app.models import db, User, SecurityAlert, SecurityEvent
from app.security.event_logger import log_security_event

def test_real_db_simulation():
    app = create_app(Config)
    with app.app_context():
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        if 'security_alerts' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('security_alerts')]
            if 'email_dispatch_status' not in columns:
                print("Adding missing column email_dispatch_status to security_alerts table...")
                db.session.execute(text("ALTER TABLE security_alerts ADD COLUMN email_dispatch_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL"))
                db.session.commit()

        # Check if users exist in the DB
        users = User.query.all()
        print(f"Users found in DB: {len(users)}")
        if not users:
            print("No users found in database.")
            return

        test_user = users[0]
        print(f"Testing simulation for User ID: {test_user.id} ({test_user.email})")

        sim_type = 'SUSPICIOUS_LOGIN_ATTEMPT'
        selected = {
            'event_type': 'SUSPICIOUS_LOGIN_ATTEMPT',
            'desc': f"[SIMULATED DEMO] 4 rapid failed logins detected from unusual IP 198.51.100.42 targeting '{test_user.email}'.",
            'severity': 'HIGH',
            'action': 'ALERT_GENERATED',
            'title': '[SIMULATED] Suspicious Login Pattern Detected'
        }

        try:
            print("Calling log_security_event...")
            event = log_security_event(
                event_type=selected['event_type'],
                description=selected['desc'],
                severity=selected['severity'],
                user_id=test_user.id,
                detection_status='DETECTED',
                response_action=selected['action'],
                is_simulated=True,
                create_alert=True,
                alert_title=selected['title']
            )
            if event:
                print("SUCCESS: Event logged with ID:", event.id)
            else:
                print("FAILURE: log_security_event returned None!")
        except Exception as e:
            print("EXCEPTIONAL FAILURE:", e)
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    test_real_db_simulation()
