from functools import wraps
from datetime import datetime, timedelta, timezone
import jwt
from flask import request, current_app
from ..models import db, User
from ..utils.helpers import error_response

def encode_token(user_id, role='user', expires_in_hours=24):
    """Generates a secure signed JWT token."""
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user_id), # RFC 7519 requires sub to be a string
        'role': role,
        'iat': now,
        'exp': now + timedelta(hours=expires_in_hours)
    }
    secret = current_app.config.get('JWT_SECRET_KEY', 'default-fallback-key')
    return jwt.encode(payload, secret, algorithm='HS256')

def decode_token(token):
    """Decodes and validates a JWT token."""
    try:
        secret = current_app.config.get('JWT_SECRET_KEY', 'default-fallback-key')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token has expired. Please log in again.'}
    except jwt.InvalidTokenError as e:
        return {'error': f'Invalid token: {str(e)}'}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return error_response("Authentication token is missing.", 401)

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return error_response("Invalid Authorization header format. Expected 'Bearer <token>'.", 401)

        token = parts[1]
        decoded = decode_token(token)
        if 'error' in decoded:
            return error_response(decoded['error'], 401)

        try:
            user_id = int(decoded['sub'])
            user = db.session.get(User, user_id)
        except (ValueError, TypeError):
            user = None

        if not user:
            return error_response("User associated with this token was not found.", 401)

        if not user.is_active:
            return error_response("Your account has been deactivated. Please contact support.", 403)

        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = getattr(request, 'current_user', None)
        if not user or user.role != 'admin':
            from .event_logger import log_security_event
            log_security_event(
                event_type='UNAUTHORIZED_ROUTE_ACCESS',
                description=f"Non-admin user '{user.email if user else 'anonymous'}' attempted to access restricted admin route '{request.path}'.",
                severity='HIGH',
                user_id=user.id if user else None,
                response_action='DENIED',
                create_alert=True,
                alert_title="Unauthorized Admin Route Access Attempt"
            )
            return error_response("Administrator privileges required to access this resource.", 403)
        return f(*args, **kwargs)
    return decorated
