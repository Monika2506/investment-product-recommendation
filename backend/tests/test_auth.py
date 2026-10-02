import pytest
from app import create_app
from app.config import TestConfig
from app.models import db, User

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_user_registration(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'test@example.com',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    })
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data['success'] is True
    assert 'token' in json_data['data']
    assert json_data['data']['user']['email'] == 'test@example.com'

def test_duplicate_registration(client):
    client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'dup@example.com',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    })
    res = client.post('/api/auth/register', json={
        'full_name': 'Test User Two',
        'email': 'dup@example.com',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    })
    assert res.status_code == 409
    assert res.get_json()['success'] is False

def test_login_success_and_failure(client):
    client.post('/api/auth/register', json={
        'full_name': 'Login Tester',
        'email': 'login@example.com',
        'password': 'Secret@123',
        'confirm_password': 'Secret@123'
    })

    # Successful login
    res = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'Secret@123'
    })
    assert res.status_code == 200
    assert 'token' in res.get_json()['data']

    # Failed login with wrong password
    res_fail = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'WrongPassword!99'
    })
    assert res_fail.status_code == 401
    assert res_fail.get_json()['success'] is False

def test_weak_password_validation(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Weak Pwd',
        'email': 'weak@example.com',
        'password': 'weak',
        'confirm_password': 'weak'
    })
    assert res.status_code == 400
    assert "at least 8 characters" in res.get_json()['message']
