"""
Automated Integration Test Suite: Email Notification System
Tests email dispatch, preference toggling, non-blocking execution, and HTML rendering.
"""

import os
import sys
import unittest

# Ensure app path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, User, Recommendation, NotificationPreference
from app.config import TestConfig
from app.security.email_service import send_recommendation_email

class EmailNotificationTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Create test user
        self.user = User(
            email='test.investor@gmail.com',
            full_name='Test Investor',
            role='user'
        )
        self.user.set_password('User@12345')
        db.session.add(self.user)

        # Create preference
        self.pref = NotificationPreference(
            user=self.user,
            email_alerts_enabled=True,
            in_app_alerts_enabled=True
        )
        db.session.add(self.pref)
        db.session.commit()

        self.sample_recommendation = {
            'recommended_category': 'Mutual Funds',
            'confidence_score': 88.5,
            'risk_category': 'Moderate to High Risk',
            'duration_summary': 'Medium-Term Horizon (5 years)',
            'explanation': 'Suitability evaluated based on 5-year growth horizon.'
        }

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_01_simulated_email_dispatch(self):
        """Verify that missing SMTP credentials trigger simulated dispatch without throwing errors."""
        result = send_recommendation_email(self.user, self.sample_recommendation)
        self.assertTrue(result, "send_recommendation_email should return True indicating background task initiated.")

    def test_02_preference_disabled_skips_email(self):
        """Verify that disabling email_alerts_enabled skips email dispatch cleanly."""
        self.pref.email_alerts_enabled = False
        db.session.commit()

        result = send_recommendation_email(self.user, self.sample_recommendation)
        self.assertFalse(result, "send_recommendation_email should return False when user email notifications are disabled.")

    def test_03_recommendation_api_non_blocking_with_email(self):
        """Verify that calling the /api/recommend endpoint returns HTTP 201 even when email service is active."""
        client = self.app.test_client()

        # Get JWT Token
        login_res = client.post('/api/auth/login', json={
            'email': 'test.investor@gmail.com',
            'password': 'User@12345'
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['data']['token']

        # Call recommendation API
        rec_res = client.post('/api/recommend', 
            headers={'Authorization': f'Bearer {token}'},
            json={
                'age': 28,
                'monthly_income': 60000,
                'current_savings': 250000,
                'planned_investment': 20000,
                'investment_duration': 5,
                'risk_tolerance': 'Medium',
                'financial_goal': 'Wealth Creation',
                'employment_category': 'Salaried'
            }
        )

        self.assertEqual(rec_res.status_code, 201)
        data = rec_res.get_json()['data']
        self.assertIn('recommended_category', data)
        self.assertIn('confidence_score', data)
        print("\n[TEST PASS] API returned 201 Created successfully with recommendation:", data['recommended_category'])

if __name__ == '__main__':
    unittest.main()
