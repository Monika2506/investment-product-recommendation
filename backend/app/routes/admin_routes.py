import os
import json
from datetime import datetime, timedelta
from flask import Blueprint, request
from sqlalchemy import func
from ..models import db, User, Recommendation, SecurityEvent, SecurityAlert
from ..utils.helpers import success_response, error_response
from ..security.auth import token_required, admin_required
from ..security.event_logger import log_security_event

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@token_required
@admin_required
def get_admin_dashboard():
    # User counts
    total_users = User.query.count()
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    active_users = User.query.filter(User.last_login_at >= one_day_ago).count()
    if active_users == 0 and total_users > 0:
        active_users = User.query.filter_by(is_active=True).count()

    # Security event counts
    total_events = SecurityEvent.query.count()
    failed_logins = SecurityEvent.query.filter_by(event_type='FAILED_LOGIN').count()
    
    # Alert counts
    open_alerts = SecurityAlert.query.filter_by(status='PENDING').count()
    acknowledged_alerts = SecurityAlert.query.filter(SecurityAlert.status.in_(['ACKNOWLEDGED', 'RESOLVED'])).count()

    # Severity distribution
    severity_counts = {
        'LOW': SecurityEvent.query.filter_by(severity='LOW').count(),
        'MEDIUM': SecurityEvent.query.filter_by(severity='MEDIUM').count(),
        'HIGH': SecurityEvent.query.filter_by(severity='HIGH').count(),
        'CRITICAL': SecurityEvent.query.filter_by(severity='CRITICAL').count()
    }

    # Aggregated recommendation statistics (anonymous category distribution)
    category_counts_query = db.session.query(
        Recommendation.recommended_category, func.count(Recommendation.id)
    ).group_by(Recommendation.recommended_category).all()
    recommendation_distribution = [
        {'category': cat, 'count': count} for cat, count in category_counts_query
    ]

    # 7-day security events trend
    trend_data = []
    for i in range(6, -1, -1):
        day_date = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        cnt = SecurityEvent.query.filter(
            SecurityEvent.created_at >= day_start,
            SecurityEvent.created_at <= day_end
        ).count()
        trend_data.append({
            'date': day_date.strftime('%b %d'),
            'events': cnt
        })

    # Recent 5 alerts
    recent_alerts = SecurityAlert.query.order_by(SecurityAlert.created_at.desc()).limit(5).all()

    return success_response({
        'metrics': {
            'total_users': total_users,
            'active_users': active_users,
            'total_events': total_events,
            'failed_logins': failed_logins,
            'open_alerts': open_alerts,
            'acknowledged_alerts': acknowledged_alerts
        },
        'severity_counts': severity_counts,
        'recommendation_distribution': recommendation_distribution,
        'trend_data': trend_data,
        'recent_alerts': [a.to_dict() for a in recent_alerts]
    }, "Admin dashboard summary loaded.")

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users_list():
    search = request.args.get('search', '').strip().lower()
    role = request.args.get('role', '')

    query = User.query
    if search:
        query = query.filter((User.email.ilike(f'%{search}%')) | (User.full_name.ilike(f'%{search}%')))
    if role:
        query = query.filter_by(role=role)

    users = query.order_by(User.created_at.desc()).all()
    return success_response([u.to_dict(include_sensitive=True) for u in users])

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@token_required
@admin_required
def toggle_user_status(user_id):
    current_admin = request.current_user
    user = db.session.get(User, user_id)
    if not user:
        return error_response("User not found.", 404)

    if user.id == current_admin.id:
        return error_response("Administrators cannot suspend their own active account.", 400)

    user.is_active = not user.is_active
    new_status = "activated" if user.is_active else "suspended"
    db.session.commit()

    log_security_event(
        event_type='USER_STATUS_MODIFIED',
        description=f"Administrator '{current_admin.email}' {new_status} user '{user.email}' (ID: {user.id}).",
        severity='MEDIUM',
        user_id=user.id,
        response_action='ALLOW'
    )

    return success_response({
        'user_id': user.id,
        'is_active': user.is_active,
        'status': new_status
    }, f"User account has been {new_status}.")

@admin_bp.route('/events', methods=['GET'])
@token_required
@admin_required
def get_all_events():
    severity = request.args.get('severity', '')
    event_type = request.args.get('event_type', '')
    limit = min(int(request.args.get('limit', 100)), 200)

    query = SecurityEvent.query
    if severity:
        query = query.filter_by(severity=severity)
    if event_type:
        query = query.filter_by(event_type=event_type)

    events = query.order_by(SecurityEvent.created_at.desc()).limit(limit).all()
    return success_response([e.to_dict() for e in events])

@admin_bp.route('/alerts', methods=['GET'])
@token_required
@admin_required
def get_all_alerts():
    status = request.args.get('status', '')
    severity = request.args.get('severity', '')

    query = SecurityAlert.query
    if status:
        query = query.filter_by(status=status)
    if severity:
        query = query.filter_by(severity=severity)

    alerts = query.order_by(SecurityAlert.created_at.desc()).all()
    return success_response([a.to_dict() for a in alerts])

@admin_bp.route('/alerts/<alert_id>/investigate', methods=['POST'])
@token_required
@admin_required
def investigate_alert(alert_id):
    current_admin = request.current_user
    alert = db.session.get(SecurityAlert, alert_id)
    if not alert:
        return error_response("Alert not found.", 404)

    data = request.get_json() or {}
    notes = data.get('admin_notes', '').strip()
    status = data.get('status', 'ACKNOWLEDGED')

    if status not in ['PENDING', 'ACKNOWLEDGED', 'RESOLVED']:
        return error_response("Invalid status value. Choose PENDING, ACKNOWLEDGED, or RESOLVED.", 400)

    if notes:
        alert.admin_notes = notes
    alert.status = status
    alert.acknowledged_by = current_admin.email
    alert.acknowledged_at = datetime.utcnow()

    if alert.event:
        alert.event.alert_status = status

    db.session.commit()

    log_security_event(
        event_type='ALERT_INVESTIGATED',
        description=f"Administrator '{current_admin.email}' updated alert '{alert.title}' to {status}.",
        severity='LOW',
        user_id=current_admin.id,
        response_action='ALLOW'
    )

    return success_response(alert.to_dict(), "Investigation notes updated.")

@admin_bp.route('/model-metrics', methods=['GET'])
@token_required
@admin_required
def get_model_metrics():
    # Load metadata file from backend/app/ml/model_metadata.json
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    meta_path = os.path.join(current_dir, 'ml', 'model_metadata.json')

    if os.path.exists(meta_path):
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    else:
        metadata = {'error': 'Metadata file not found. Train model first.'}

    return success_response(metadata, "ML Model metrics loaded.")
