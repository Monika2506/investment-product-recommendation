from datetime import datetime
from flask import Blueprint, request
from ..models import db, SecurityEvent, SecurityAlert, NotificationPreference
from ..utils.helpers import success_response, error_response, get_client_ip, parse_user_agent
from ..security.auth import token_required
from ..security.event_logger import log_security_event

security_bp = Blueprint('security', __name__, url_prefix='/api/security')

@security_bp.route('/events', methods=['GET'])
@token_required
def get_user_events():
    user = request.current_user
    limit = min(int(request.args.get('limit', 50)), 100)
    
    events = SecurityEvent.query.filter_by(user_id=user.id)\
        .order_by(SecurityEvent.created_at.desc())\
        .limit(limit).all()
        
    return success_response([e.to_dict() for e in events], f"Retrieved {len(events)} security events.")

@security_bp.route('/alerts', methods=['GET'])
@token_required
def get_user_alerts():
    user = request.current_user
    alerts = SecurityAlert.query.filter_by(user_id=user.id)\
        .order_by(SecurityAlert.created_at.desc()).all()
    return success_response([a.to_dict() for a in alerts], f"Retrieved {len(alerts)} security alerts.")

@security_bp.route('/alerts/<alert_id>/acknowledge', methods=['POST'])
@token_required
def acknowledge_alert(alert_id):
    user = request.current_user
    alert = db.session.get(SecurityAlert, alert_id)

    if not alert:
        return error_response("Alert not found.", 404)

    if alert.user_id != user.id and user.role != 'admin':
        return error_response("Unauthorized to acknowledge this alert.", 403)

    alert.status = 'ACKNOWLEDGED'
    alert.acknowledged_by = user.email
    alert.acknowledged_at = datetime.utcnow()

    # Also update linked event status if exists
    if alert.event:
        alert.event.alert_status = 'ACKNOWLEDGED'

    db.session.commit()

    log_security_event(
        event_type='ALERT_ACKNOWLEDGED',
        description=f"User '{user.email}' acknowledged security alert '{alert.title}'.",
        severity='LOW',
        user_id=user.id,
        response_action='ALLOW'
    )

    return success_response(alert.to_dict(), "Security alert marked as acknowledged.")

@security_bp.route('/summary', methods=['GET'])
@token_required
def get_security_summary():
    user = request.current_user
    
    # Calculate security score
    total_alerts = SecurityAlert.query.filter_by(user_id=user.id).count()
    pending_alerts = SecurityAlert.query.filter_by(user_id=user.id, status='PENDING').count()
    critical_events = SecurityEvent.query.filter_by(user_id=user.id, severity='CRITICAL').count()

    base_score = 98
    if pending_alerts > 0:
        base_score -= min(30, pending_alerts * 10)
    if critical_events > 0:
        base_score -= min(25, critical_events * 15)
    security_score = max(40, base_score)

    client_ip = get_client_ip()
    ua_data = parse_user_agent()

    return success_response({
        'security_score': security_score,
        'security_rating': 'Excellent' if security_score >= 85 else ('Moderate' if security_score >= 65 else 'At Risk'),
        'total_alerts': total_alerts,
        'pending_alerts': pending_alerts,
        'critical_events': critical_events,
        'current_session': {
            'ip_address': client_ip,
            'browser': ua_data['browser'],
            'os': ua_data['os'],
            'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None,
            'metadata_notice': 'Browser and OS details inferred from client User-Agent and may be inaccurate.'
        }
    }, "Security summary retrieved.")

@security_bp.route('/preferences', methods=['GET'])
@token_required
def get_preferences():
    user = request.current_user
    pref = user.notification_pref
    if not pref:
        pref = NotificationPreference(user=user)
        db.session.add(pref)
        db.session.commit()
    return success_response(pref.to_dict())

@security_bp.route('/preferences', methods=['PUT'])
@token_required
def update_preferences():
    user = request.current_user
    data = request.get_json() or {}
    pref = user.notification_pref
    if not pref:
        pref = NotificationPreference(user=user)
        db.session.add(pref)

    if 'email_alerts_enabled' in data:
        pref.email_alerts_enabled = bool(data['email_alerts_enabled'])
    if 'in_app_alerts_enabled' in data:
        pref.in_app_alerts_enabled = bool(data['in_app_alerts_enabled'])
    if 'alert_severity_threshold' in data:
        if data['alert_severity_threshold'] in ['LOW', 'MEDIUM', 'HIGH']:
            pref.alert_severity_threshold = data['alert_severity_threshold']

    db.session.commit()
    return success_response(pref.to_dict(), "Security preferences updated.")

@security_bp.route('/simulate-event', methods=['POST'])
@token_required
def simulate_security_event():
    """
    Academic / Evaluation utility: Generates a simulated cybersecurity event
    to test the real-time alerting pipeline.
    """
    user = request.current_user
    data = request.get_json() or {}
    sim_type = data.get('type', 'SUSPICIOUS_LOGIN_ATTEMPT')

    sim_scenarios = {
        'SUSPICIOUS_LOGIN_ATTEMPT': {
            'event_type': 'SUSPICIOUS_LOGIN_ATTEMPT',
            'desc': f"[SIMULATED DEMO] 4 rapid failed logins detected from unusual IP 198.51.100.42 targeting '{user.email}'.",
            'severity': 'HIGH',
            'action': 'ALERT_GENERATED',
            'title': '[SIMULATED] Suspicious Login Pattern Detected'
        },
        'UNAUTHORIZED_PROFILE_ACCESS': {
            'event_type': 'UNAUTHORIZED_PROFILE_ACCESS',
            'desc': f"[SIMULATED DEMO] Cross-tenant profile inspection attempt blocked on resource /api/recommendations/9999.",
            'severity': 'CRITICAL',
            'action': 'DENIED',
            'title': '[SIMULATED] Critical Alert: Unauthorized Profile Access Blocked'
        },
        'RATE_LIMIT_EXCEEDED': {
            'event_type': 'RATE_LIMIT_EXCEEDED',
            'desc': f"[SIMULATED DEMO] Client exceeded burst API threshold (120 req/min) on financial calculation endpoint.",
            'severity': 'MEDIUM',
            'action': 'THROTTLED',
            'title': '[SIMULATED] API Rate Limit Exceeded'
        }
    }

    selected = sim_scenarios.get(sim_type, sim_scenarios['SUSPICIOUS_LOGIN_ATTEMPT'])

    event = log_security_event(
        event_type=selected['event_type'],
        description=selected['desc'],
        severity=selected['severity'],
        user_id=user.id,
        detection_status='DETECTED',
        response_action=selected['action'],
        is_simulated=True,
        create_alert=True,
        alert_title=selected['title']
    )

    if not event:
        return error_response("Failed to record simulated security event.", 500)

    alert = SecurityAlert.query.filter_by(event_id=event.id).first()

    return success_response({
        'event': event.to_dict(),
        'alert': alert.to_dict() if alert else None,
        'simulated': True,
        'note': 'Demonstration event recorded in security logs for evaluation.'
    }, f"Simulated security event '{selected['event_type']}' triggered successfully.", 201)
