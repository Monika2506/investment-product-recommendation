import pytest
from app import create_app
from app.config import TestConfig
from app.models import db, User

@pytest.fixture
def auth_client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            
            # Register user
            res = client.post('/api/auth/register', json={
                'full_name': 'Investor One',
                'email': 'investor1@example.com',
                'password': 'Investor@123',
                'confirm_password': 'Investor@123'
            })
            token1 = res.get_json()['data']['token']

            # Register second user for cross-tenant unauthorized check
            res2 = client.post('/api/auth/register', json={
                'full_name': 'Investor Two',
                'email': 'investor2@example.com',
                'password': 'Investor@123',
                'confirm_password': 'Investor@123'
            })
            token2 = res2.get_json()['data']['token']

            yield client, token1, token2
            db.session.remove()
            db.drop_all()

def test_financial_profile_save_and_get(auth_client):
    client, token1, _ = auth_client
    headers = {'Authorization': f'Bearer {token1}'}

    profile_payload = {
        'age': 30,
        'monthly_income': 65000,
        'current_savings': 300000,
        'planned_investment': 25000,
        'investment_duration': 5,
        'risk_tolerance': 'Medium',
        'financial_goal': 'Wealth Creation',
        'employment_category': 'Salaried'
    }

    res = client.post('/api/profile', json=profile_payload, headers=headers)
    assert res.status_code == 201
    assert res.get_json()['success'] is True

    get_res = client.get('/api/profile', headers=headers)
    assert get_res.status_code == 200
    assert get_res.get_json()['data']['age'] == 30

def test_recommendation_generation(auth_client):
    client, token1, _ = auth_client
    headers = {'Authorization': f'Bearer {token1}'}

    payload = {
        'age': 25,
        'monthly_income': 45000,
        'current_savings': 150000,
        'planned_investment': 15000,
        'investment_duration': 1,
        'risk_tolerance': 'Low',
        'financial_goal': 'Emergency Fund',
        'employment_category': 'Salaried'
    }

    res = client.post('/api/recommend', json=payload, headers=headers)
    assert res.status_code == 201
    data = res.get_json()['data']
    assert 'recommended_category' in data
    assert 'Fixed Deposit (FD)' == data['recommended_category']
    assert 'explanation' in data
    assert 'confidence_score' in data
    assert len(data['alternatives']) > 0

def test_unauthorized_cross_profile_access(auth_client):
    client, token1, token2 = auth_client
    headers1 = {'Authorization': f'Bearer {token1}'}
    headers2 = {'Authorization': f'Bearer {token2}'}

    # User 1 creates recommendation
    res = client.post('/api/recommend', json={
        'age': 35,
        'monthly_income': 90000,
        'current_savings': 500000,
        'planned_investment': 50000,
        'investment_duration': 7,
        'risk_tolerance': 'High',
        'financial_goal': 'Wealth Creation'
    }, headers=headers1)
    rec_id = res.get_json()['data']['id']

    # User 2 attempts to access User 1's recommendation
    unauth_res = client.get(f'/api/recommendations/{rec_id}', headers=headers2)
    assert unauth_res.status_code == 403
    assert unauth_res.get_json()['success'] is False
