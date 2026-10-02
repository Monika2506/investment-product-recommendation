"""
Database Seed Script
Initializes test users, admin credentials, sample financial profiles,
recommendation history, and simulated security telemetry.
"""

from datetime import datetime, timedelta
from app import create_app
from app.models import db, User, FinancialProfile, Recommendation, SecurityEvent, SecurityAlert, NotificationPreference

def seed():
    app = create_app()
    with app.app_context():
        print("[*] Resetting database tables...")
        db.drop_all()
        db.create_all()

        print("[*] Creating user accounts...")
        # 1. Administrator
        admin = User(
            full_name="SecOps Administrator",
            email="admin@investiq.local",
            role="admin",
            is_active=True,
            last_login_at=datetime.utcnow() - timedelta(minutes=15),
            last_login_ip="192.168.1.100"
        )
        admin.set_password("Admin@12345")
        db.session.add(admin)

        # 2. Demo User (Alex Vance)
        user1 = User(
            full_name="Alex Vance",
            email="user@investiq.local",
            role="user",
            is_active=True,
            last_login_at=datetime.utcnow() - timedelta(hours=2),
            last_login_ip="192.168.1.105"
        )
        user1.set_password("User@12345")
        db.session.add(user1)

        # 3. Additional Users
        user2 = User(
            full_name="Priya Sharma",
            email="priya.sharma@investiq.local",
            role="user",
            is_active=True,
            last_login_at=datetime.utcnow() - timedelta(days=1),
            last_login_ip="192.168.1.110"
        )
        user2.set_password("Priya@12345")
        db.session.add(user2)

        user3 = User(
            full_name="David Miller",
            email="david.m@investiq.local",
            role="user",
            is_active=False, # Suspended account demonstration
            last_login_at=datetime.utcnow() - timedelta(days=5),
            last_login_ip="203.0.113.88"
        )
        user3.set_password("David@12345")
        db.session.add(user3)

        db.session.commit()

        print("[*] Creating financial profiles...")
        # Profile for Alex Vance
        profile1 = FinancialProfile(
            user_id=user1.id,
            age=29,
            monthly_income=85000.0,
            current_savings=450000.0,
            planned_investment=30000.0,
            investment_duration=6,
            risk_tolerance="Medium",
            financial_goal="Wealth Creation",
            employment_category="Salaried"
        )
        db.session.add(profile1)

        # Profile for Priya
        profile2 = FinancialProfile(
            user_id=user2.id,
            age=52,
            monthly_income=120000.0,
            current_savings=2500000.0,
            planned_investment=80000.0,
            investment_duration=12,
            risk_tolerance="Low",
            financial_goal="Retirement",
            employment_category="Salaried"
        )
        db.session.add(profile2)

        # Notification Preferences
        for u in [admin, user1, user2, user3]:
            pref = NotificationPreference(
                user_id=u.id,
                email_alerts_enabled=True,
                in_app_alerts_enabled=True,
                alert_severity_threshold="LOW"
            )
            db.session.add(pref)

        db.session.commit()

        print("[*] Creating sample recommendation history...")
        rec1 = Recommendation(
            user_id=user1.id,
            recommended_category="Mutual Funds",
            confidence_score=88.5,
            risk_category="Moderate to High Risk",
            duration_summary="Medium-Term Horizon (6 years)",
            explanation="The Random Forest classification model identified Mutual Funds as your optimal asset class with an algorithmic suitability confidence of 88.5%. Your medium risk profile and 6-year duration target consistent inflation-beating yields tailored for your 'Wealth Creation' objective.",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        rec1.profile_snapshot = {
            'age': 29,
            'monthly_income': 85000.0,
            'current_savings': 450000.0,
            'planned_investment': 30000.0,
            'investment_duration': 6,
            'risk_tolerance': 'Medium',
            'financial_goal': 'Wealth Creation'
        }
        rec1.alternatives = [
            {'category': 'Gold', 'match_probability': 0.08, 'risk_level': 'Moderate Risk', 'expected_return': '8.0% - 10.0% p.a.', 'liquidity': 'High', 'comparison_note': 'Safe haven asset providing inflation hedge.'},
            {'category': 'Stocks', 'match_probability': 0.03, 'risk_level': 'High Risk', 'expected_return': '12.0% - 18.0%+ p.a.', 'liquidity': 'Very High', 'comparison_note': 'Higher growth upside with market volatility.'}
        ]
        rec1.key_considerations = [
            "Professional fund management offering diversified equity exposure.",
            "Systematic Investment Plans (SIP) allow rupee-cost averaging.",
            "Subject to market volatility; historical returns do not guarantee future yields."
        ]
        db.session.add(rec1)

        rec2 = Recommendation(
            user_id=user1.id,
            recommended_category="Fixed Deposit (FD)",
            confidence_score=94.2,
            risk_category="Low Risk",
            duration_summary="Short-Term Horizon (1 year)",
            explanation="Your selection of an Emergency Fund goal with a 1-year timeline prioritizes capital safety and immediate liquidity.",
            created_at=datetime.utcnow() - timedelta(days=14)
        )
        rec2.profile_snapshot = {
            'age': 29,
            'monthly_income': 85000.0,
            'current_savings': 350000.0,
            'planned_investment': 50000.0,
            'investment_duration': 1,
            'risk_tolerance': 'Low',
            'financial_goal': 'Emergency Fund'
        }
        rec2.alternatives = [
            {'category': 'Bonds', 'match_probability': 0.04, 'risk_level': 'Low to Moderate Risk', 'expected_return': '7.5% - 9.5% p.a.', 'liquidity': 'Moderate', 'comparison_note': 'Fixed income alternative.'}
        ]
        rec2.key_considerations = [
            "Guaranteed returns backed by deposit insurance.",
            "High liquidity for emergency withdrawals."
        ]
        db.session.add(rec2)

        print("[*] Creating security telemetry and alerts...")
        # Normal event
        evt1 = SecurityEvent(
            id="evt-demo-1001",
            event_type="SUCCESSFUL_LOGIN",
            user_id=user1.id,
            severity="LOW",
            description="User 'user@investiq.local' authenticated successfully via token verification.",
            ip_address="192.168.1.105",
            browser="Google Chrome",
            os="Windows 10/11",
            endpoint="/api/auth/login",
            method="POST",
            detection_status="RESOLVED",
            response_action="ALLOW",
            alert_status="NONE",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.session.add(evt1)

        # Suspicious login attempt event (Simulated)
        evt2 = SecurityEvent(
            id="evt-demo-1002",
            event_type="SUSPICIOUS_LOGIN_ATTEMPT",
            user_id=user1.id,
            severity="HIGH",
            description="[SIMULATED] 3 consecutive failed login attempts detected within 2 minutes targeting 'user@investiq.local' from external IP 203.0.113.45.",
            ip_address="203.0.113.45",
            browser="Postman API Client",
            os="Linux",
            endpoint="/api/auth/login",
            method="POST",
            detection_status="DETECTED",
            response_action="ALERT_GENERATED",
            alert_status="PENDING",
            is_simulated=True,
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add(evt2)

        alert1 = SecurityAlert(
            id="alt-demo-2001",
            event_id="evt-demo-1002",
            user_id=user1.id,
            alert_type="SUSPICIOUS_LOGIN_ATTEMPT",
            title="Suspicious Login Pattern Detected",
            description="Multiple authentication failures from unusual source IP 203.0.113.45 targeting user account. Security alert issued.",
            severity="HIGH",
            status="PENDING",
            delivered_in_app=True,
            delivered_email=False,
            is_simulated=True,
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add(alert1)

        # Unauthorized access attempt (Simulated)
        evt3 = SecurityEvent(
            id="evt-demo-1003",
            event_type="UNAUTHORIZED_ROUTE_ACCESS",
            user_id=user2.id,
            severity="HIGH",
            description="[SIMULATED] Non-admin user 'priya.sharma@investiq.local' attempted to access restricted endpoint '/api/admin/dashboard'.",
            ip_address="192.168.1.110",
            browser="Mozilla Firefox",
            os="macOS",
            endpoint="/api/admin/dashboard",
            method="GET",
            detection_status="DETECTED",
            response_action="DENIED",
            alert_status="ACKNOWLEDGED",
            is_simulated=True,
            created_at=datetime.utcnow() - timedelta(days=1, hours=3)
        )
        db.session.add(evt3)

        alert2 = SecurityAlert(
            id="alt-demo-2002",
            event_id="evt-demo-1003",
            user_id=admin.id,
            alert_type="UNAUTHORIZED_ROUTE_ACCESS",
            title="Unauthorized Admin Route Access Attempt",
            description="Access to /api/admin/dashboard denied for non-administrative role.",
            severity="HIGH",
            status="ACKNOWLEDGED",
            delivered_in_app=True,
            admin_notes="Reviewed during audit. User confirmed accidental navigation via stale bookmark.",
            acknowledged_by="admin@investiq.local",
            acknowledged_at=datetime.utcnow() - timedelta(days=1),
            is_simulated=True,
            created_at=datetime.utcnow() - timedelta(days=1, hours=3)
        )
        db.session.add(alert2)

        # Failed Login Event
        evt4 = SecurityEvent(
            id="evt-demo-1004",
            event_type="FAILED_LOGIN",
            user_id=None,
            severity="LOW",
            description="Failed login attempt for nonexistent user 'unknown_dev@investiq.local'.",
            ip_address="198.51.100.22",
            browser="cURL Terminal",
            os="Linux",
            endpoint="/api/auth/login",
            method="POST",
            detection_status="RESOLVED",
            response_action="DENIED",
            alert_status="NONE",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(evt4)

        db.session.commit()

        print("[+] Seed completed successfully!")
        print("\nDefault Accounts:")
        print("1. Admin Account:")
        print("   Email:    admin@investiq.local")
        print("   Password: Admin@12345")
        print("2. User Account:")
        print("   Email:    user@investiq.local")
        print("   Password: User@12345")

if __name__ == '__main__':
    seed()
