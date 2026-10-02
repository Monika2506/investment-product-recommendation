import pytest
from app import create_app
from app.config import TestConfig
from app.models import db, User, SecurityEvent, SecurityAlert

@pytest.fixture
def sec_client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()

            # Normal user
            u = User(full_name='Normal User', email='normal@investiq.local', role='user', is_active=True)
            u.set_password('Normal@123')
            db.session.add(u)

            # Admin user
            a = User(full_name='Sec Admin', email='admin@investiq.local', role='admin', is_active=True)
            a.set_password('Admin@123')
            db.session.add(a)

            db.session.commit()

            # Tokens
            from app.security.auth import encode_token
            u_token = encode_token(u.id, u.role)
            a_token = encode_token(a.id, a.role)

            yield client, u_token, a_token, u.id, a.id
            db.session.remove()
            db.drop_all()

def test_admin_route_protection(sec_client):
    client, u_token, a_token, _, _ = sec_client

    # Normal user trying to access admin dashboard
    res_deny = client.get('/api/admin/dashboard', headers={'Authorization': f'Bearer {u_token}'})
    assert res_deny.status_code == 403

    # Admin user accessing admin dashboard
    res_allow = client.get('/api/admin/dashboard', headers={'Authorization': f'Bearer {a_token}'})
    assert res_allow.status_code == 200
    assert 'metrics' in res_allow.get_json()['data']

def test_security_event_simulation_and_alert(sec_client):
    client, u_token, _, u_id, _ = sec_client
    headers = {'Authorization': f'Bearer {u_token}'}

    # Simulate security event
    res = client.post('/api/security/simulate-event', json={'type': 'SUSPICIOUS_LOGIN_ATTEMPT'}, headers=headers)
    assert res.status_code == 201

    # Check alert feed
    alerts_res = client.get('/api/security/alerts', headers=headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.get_json()['data']
    assert len(alerts) > 0

    # Acknowledge the alert
    alert_id = alerts[0]['id']
    ack_res = client.post(f'/api/security/alerts/{alert_id}/acknowledge', headers=headers)
    assert ack_res.status_code == 200
    assert ack_res.get_json()['data']['status'] == 'ACKNOWLEDGED'
