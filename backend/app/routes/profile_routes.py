from flask import Blueprint, request
from ..models import db, FinancialProfile
from ..utils.helpers import success_response, error_response
from ..utils.validators import validate_financial_profile
from ..security.auth import token_required
from ..security.detector import ThreatDetector
from ..security.event_logger import log_security_event

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@token_required
def get_profile():
    user = request.current_user
    if not user.profile:
        return success_response(None, "No financial profile found for this user.")
    return success_response(user.profile.to_dict(), "Financial profile retrieved.")

@profile_bp.route('', methods=['POST', 'PUT'])
@token_required
def save_profile():
    user = request.current_user
    data = request.get_json() or {}

    # Check malicious patterns
    if ThreatDetector.check_malformed_input(data):
        return error_response("Malformed input detected. Request rejected.", 400)

    # Validate financial fields
    is_valid, errors = validate_financial_profile(data)
    if not is_valid:
        return error_response("Financial profile validation failed.", 400, errors=errors)

    profile = user.profile
    is_new = (profile is None)

    if is_new:
        profile = FinancialProfile(
            user_id=user.id,
            age=int(data['age']),
            monthly_income=float(data['monthly_income']),
            current_savings=float(data['current_savings']),
            planned_investment=float(data['planned_investment']),
            investment_duration=int(data['investment_duration']),
            risk_tolerance=data['risk_tolerance'],
            financial_goal=data['financial_goal'],
            employment_category=data.get('employment_category', 'Salaried')
        )
        db.session.add(profile)
    else:
        profile.age = int(data['age'])
        profile.monthly_income = float(data['monthly_income'])
        profile.current_savings = float(data['current_savings'])
        profile.planned_investment = float(data['planned_investment'])
        profile.investment_duration = int(data['investment_duration'])
        profile.risk_tolerance = data['risk_tolerance']
        profile.financial_goal = data['financial_goal']
        profile.employment_category = data.get('employment_category', profile.employment_category)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Database error while saving profile: {str(e)}", 500)

    log_security_event(
        event_type='PROFILE_UPDATED' if not is_new else 'PROFILE_CREATED',
        description=f"User '{user.email}' {'updated' if not is_new else 'created'} their financial profile.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )

    return success_response(profile.to_dict(), "Financial profile saved successfully.", 201 if is_new else 200)
