from flask import Blueprint, request
from ..models import db, Recommendation
from ..utils.helpers import success_response, error_response
from ..utils.validators import validate_financial_profile
from ..security.auth import token_required
from ..security.detector import ThreatDetector
from ..security.event_logger import log_security_event
from ..security.email_service import send_recommendation_email
from ..ml.predictor import InvestmentPredictor

recommend_bp = Blueprint('recommend', __name__, url_prefix='/api')

@recommend_bp.route('/recommend', methods=['POST'])
@token_required
def generate_recommendation():
    user = request.current_user
    data = request.get_json() or {}

    # Check injection / malformed input
    if ThreatDetector.check_malformed_input(data):
        return error_response("Malformed input detected. Request rejected.", 400)

    # If payload is empty or missing key fields, fallback to saved profile
    if not data.get('monthly_income') and user.profile:
        data = user.profile.to_dict()

    # Validate profile parameters
    is_valid, errors = validate_financial_profile(data)
    if not is_valid:
        return error_response("Incomplete or invalid financial profile for recommendation.", 400, errors=errors)

    try:
        predictor = InvestmentPredictor.get_instance()
        result = predictor.predict(data)
    except Exception as e:
        return error_response(f"ML Recommendation Engine error: {str(e)}", 500)

    # Persist recommendation history for the user
    rec_record = Recommendation(
        user_id=user.id,
        recommended_category=result['recommended_category'],
        confidence_score=result['confidence_score'],
        risk_category=result['risk_category'],
        duration_summary=result['duration_summary'],
        explanation=result['explanation']
    )
    rec_record.profile_snapshot = {
        'age': data.get('age'),
        'monthly_income': data.get('monthly_income'),
        'current_savings': data.get('current_savings'),
        'planned_investment': data.get('planned_investment'),
        'investment_duration': data.get('investment_duration'),
        'risk_tolerance': data.get('risk_tolerance'),
        'financial_goal': data.get('financial_goal')
    }
    rec_record.alternatives = result['alternatives']
    rec_record.key_considerations = result['key_considerations']

    db.session.add(rec_record)
    db.session.commit()

    # Return full package including the new record ID
    result['id'] = rec_record.id
    result['created_at'] = rec_record.created_at.isoformat()

    # Dispatch asynchronous email notification (non-blocking)
    try:
        send_recommendation_email(user, result)
    except Exception as email_err:
        # Email failure will NEVER break the recommendation response
        pass

    # Log security event
    log_security_event(
        event_type='RECOMMENDATION_GENERATED',
        description=f"Generated recommendation '{result['recommended_category']}' for user '{user.email}'.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )

    return success_response(result, "Recommendation generated successfully.", 201)

@recommend_bp.route('/recommendations/history', methods=['GET'])
@token_required
def get_recommendation_history():
    user = request.current_user
    recs = Recommendation.query.filter_by(user_id=user.id).order_by(Recommendation.created_at.desc()).all()
    data = [r.to_dict() for r in recs]
    return success_response(data, f"Retrieved {len(data)} past recommendations.")

@recommend_bp.route('/recommendations/<int:rec_id>', methods=['GET'])
@token_required
def get_recommendation_detail(rec_id):
    user = request.current_user
    rec = db.session.get(Recommendation, rec_id)

    if not rec:
        return error_response("Recommendation not found.", 404)

    # Cybersecurity Access Control Check
    if rec.user_id != user.id and user.role != 'admin':
        # Unauthorized access attempt detected!
        log_security_event(
            event_type='UNAUTHORIZED_PROFILE_ACCESS',
            description=(
                f"Unauthorized access breach attempt: User '{user.email}' (ID: {user.id}) "
                f"attempted to read recommendation ID {rec_id} belonging to user ID {rec.user_id}."
            ),
            severity='CRITICAL',
            user_id=user.id,
            response_action='DENIED',
            create_alert=True,
            alert_title="Critical Alert: Unauthorized Profile / Recommendation Access Attempt"
        )
        return error_response("Access Denied: You do not have permission to view this financial record.", 403)

    return success_response(rec.to_dict(), "Recommendation details retrieved.")
