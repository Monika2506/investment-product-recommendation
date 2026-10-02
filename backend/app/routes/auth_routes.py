from datetime import datetime
from flask import Blueprint, request
from ..models import db, User, NotificationPreference
from ..utils.helpers import success_response, error_response, get_client_ip
from ..utils.validators import validate_email, validate_password
from ..security.auth import encode_token, token_required
from ..security.event_logger import log_security_event
from ..security.detector import ThreatDetector

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    # Check injection / malformed input
    if ThreatDetector.check_malformed_input(data):
        return error_response("Malformed input detected. Request rejected.", 400)

    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    if not full_name:
        return error_response("Full name is required.", 400)

    valid_email, err_email = validate_email(email)
    if not valid_email:
        return error_response(err_email, 400)

    if password != confirm_password:
        return error_response("Passwords do not match.", 400)

    valid_pwd, err_pwd = validate_password(password)
    if not valid_pwd:
        return error_response(err_pwd, 400)

    # Check duplicate
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return error_response("An account with this email address already exists.", 409)

    user = User(
        full_name=full_name,
        email=email,
        role='user',
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)

    # Add default notification preferences
    pref = NotificationPreference(
        user=user,
        email_alerts_enabled=True,
        in_app_alerts_enabled=True,
        alert_severity_threshold='LOW'
    )
    db.session.add(pref)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Database error during registration: {str(e)}", 500)

    # Log successful registration
    log_security_event(
        event_type='USER_REGISTERED',
        description=f"New user registered successfully: '{email}'.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )

    token = encode_token(user.id, user.role)
    return success_response({
        'user': user.to_dict(),
        'token': token
    }, "Registration successful.", 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    if ThreatDetector.check_malformed_input(data):
        return error_response("Malformed input detected. Request rejected.", 400)

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    ip = get_client_ip()

    if not email or not password:
        return error_response("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()

    # Track failed login attempts by IP and email
    if not user or not user.check_password(password):
        is_flagged, attempts, msg = ThreatDetector.record_failed_login(
            identifier=f"{ip}:{email}",
            user_id=user.id if user else None,
            email=email
        )
        return error_response(msg, 401, errors={'attempts': attempts, 'is_suspicious': is_flagged})

    if not user.is_active:
        log_security_event(
            event_type='INACTIVE_ACCOUNT_LOGIN',
            description=f"Attempted login on deactivated account: '{email}'.",
            severity='MEDIUM',
            user_id=user.id,
            response_action='DENIED'
        )
        return error_response("Your account is currently suspended. Please contact support.", 403)

    # Successful Login: Clear failed attempt tracker
    ThreatDetector.clear_failed_attempts(f"{ip}:{email}")
    user.last_login_at = datetime.utcnow()
    user.last_login_ip = ip
    db.session.commit()

    # Log successful login event
    log_security_event(
        event_type='SUCCESSFUL_LOGIN',
        description=f"User '{email}' logged in successfully.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )

    token = encode_token(user.id, user.role)
    return success_response({
        'user': user.to_dict(),
        'token': token
    }, "Login successful.")

@auth_bp.route('/demo-login', methods=['POST'])
def demo_login():
    """
    Convenience endpoint for project evaluation / live demo.
    Quickly logs into either 'user' or 'admin' demo accounts.
    """
    data = request.get_json() or {}
    role = data.get('role', 'user')
    target_email = 'admin@investiq.local' if role == 'admin' else 'user@investiq.local'

    user = User.query.filter_by(email=target_email).first()
    if not user:
        return error_response("Demo accounts not initialized. Please run seed_data.py first.", 404)

    user.last_login_at = datetime.utcnow()
    user.last_login_ip = get_client_ip()
    db.session.commit()

    token = encode_token(user.id, user.role)
    return success_response({
        'user': user.to_dict(),
        'token': token
    }, f"Logged in as demo {role}.")

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    user = request.current_user
    profile_data = user.profile.to_dict() if user.profile else None
    return success_response({
        'user': user.to_dict(include_sensitive=True),
        'profile': profile_data
    })

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    user = request.current_user
    log_security_event(
        event_type='LOGOUT',
        description=f"User '{user.email}' logged out.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )
    return success_response(None, "Logged out successfully.")

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    user = request.current_user
    data = request.get_json() or {}
    
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not user.check_password(current_password):
        log_security_event(
            event_type='PASSWORD_CHANGE_FAILED',
            description=f"Password change failed: incorrect current password for '{user.email}'.",
            severity='MEDIUM',
            user_id=user.id,
            response_action='DENIED'
        )
        return error_response("Current password does not match.", 400)

    if new_password != confirm_password:
        return error_response("New passwords do not match.", 400)

    valid_pwd, err_pwd = validate_password(new_password)
    if not valid_pwd:
        return error_response(err_pwd, 400)

    user.set_password(new_password)
    db.session.commit()

    log_security_event(
        event_type='PASSWORD_CHANGED',
        description=f"User '{user.email}' successfully updated their account password.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW',
        create_alert=True,
        alert_title="Account Security: Password Updated"
    )

    return success_response(None, "Password updated successfully.")
