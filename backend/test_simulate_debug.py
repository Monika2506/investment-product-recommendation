"""
Test script to invoke /api/security/simulate-event and inspect exact response
"""

from app import create_app
from app.config import TestConfig
from app.models import db, User

def test_simulate_endpoint():
    app = create_app(TestConfig)
    client = app.test_client()

    with app.app_context():
        db.create_all()

        # Register user
        reg = client.post('/api/auth/register', json={
            'full_name': 'Sim User',
            'email': 'sim@investiq.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        token = reg.get_json()['data']['token']
        headers = {'Authorization': f'Bearer {token}'}

        print("--- Testing SUSPICIOUS_LOGIN_ATTEMPT ---")
        res1 = client.post('/api/security/simulate-event', json={'type': 'SUSPICIOUS_LOGIN_ATTEMPT'}, headers=headers)
        print("Status code:", res1.status_code)
        print("Response JSON:", res1.get_json())

        print("\n--- Testing UNAUTHORIZED_PROFILE_ACCESS ---")
        res2 = client.post('/api/security/simulate-event', json={'type': 'UNAUTHORIZED_PROFILE_ACCESS'}, headers=headers)
        print("Status code:", res2.status_code)
        print("Response JSON:", res2.get_json())

if __name__ == '__main__':
    test_simulate_endpoint()
