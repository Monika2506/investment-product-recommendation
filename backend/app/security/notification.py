import os
import smtplib
import logging
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

logger = logging.getLogger('investiq.security')

SEVERITY_LEVELS = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}

def dispatch_security_alert(alert, user=None):
    """
    Dispatches security alert notifications via in-app and optional Gmail SMTP email.
    Respects user notification preferences, severity thresholds, and demo alert rules.
    Runs asynchronously and never fails API operations.
    """
    if not alert:
        return False

    alert.delivered_in_app = True

    # 1. Check if event is a simulated demo alert
    allow_demo_emails = os.environ.get('ALLOW_DEMO_EMAILS', 'false').lower() == 'true'
    if getattr(alert, 'is_simulated', False) and not allow_demo_emails:
        logger.info(f"[SECURITY ALERT EMAIL SKIPPED] Alert '{alert.id}' is simulated. Real email delivery suppressed.")
        alert.email_dispatch_status = 'SKIPPED_SIMULATED'
        alert.delivered_email = False
        return False

    # 2. Check user notification preferences
    if user and hasattr(user, 'notification_pref') and user.notification_pref:
        pref = user.notification_pref
        if not pref.email_alerts_enabled:
            logger.info(f"[SECURITY ALERT EMAIL SKIPPED] User '{user.email}' disabled email security alerts.")
            alert.email_dispatch_status = 'SKIPPED_PREFERENCE'
            alert.delivered_email = False
            return False

        # Threshold check
        user_min_level = SEVERITY_LEVELS.get(pref.alert_severity_threshold, 1)
        alert_level = SEVERITY_LEVELS.get(alert.severity, 1)
        if alert_level < user_min_level:
            logger.info(f"[SECURITY ALERT EMAIL SKIPPED] Severity '{alert.severity}' below user threshold '{pref.alert_severity_threshold}'.")
            alert.email_dispatch_status = 'SKIPPED_PREFERENCE'
            alert.delivered_email = False
            return False

    target_email = user.email if user else current_app.config.get('ADMIN_NOTIFICATION_EMAIL')
    if not target_email:
        alert.email_dispatch_status = 'FAILED'
        alert.delivered_email = False
        return False

    app = current_app._get_current_object()
    smtp_server = app.config.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = app.config.get('SMTP_PORT', 587)
    smtp_user = app.config.get('SMTP_USERNAME', '')
    smtp_pass = app.config.get('SMTP_PASSWORD', '')

    if not smtp_user or not smtp_pass:
        logger.info(f"[SECURITY ALERT EMAIL SIMULATED] To: {target_email} | [{alert.severity}] {alert.title} | Reason: SMTP_USERNAME or SMTP_PASSWORD missing in .env.")
        alert.email_dispatch_status = 'SKIPPED_PREFERENCE'
        alert.delivered_email = False
        return False

    # Dispatch via background thread so HTTP request returns immediately
    thread = threading.Thread(
        target=_async_send_alert_email,
        args=(app, alert.id, target_email, alert.title, alert.description, alert.severity, alert.alert_type, alert.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')),
        daemon=True
    )
    thread.start()
    return True

def _async_send_alert_email(app, alert_id, target_email, title, description, severity, alert_type, timestamp_str):
    with app.app_context():
        from ..models import db, SecurityAlert
        smtp_server = app.config.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = app.config.get('SMTP_PORT', 587)
        smtp_user = app.config.get('SMTP_USERNAME', '')
        smtp_pass = app.config.get('SMTP_PASSWORD', '')
        smtp_use_tls = app.config.get('SMTP_USE_TLS', True)
        from_email = app.config.get('ALERT_FROM_EMAIL') or smtp_user
        frontend_url = app.config.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        security_center_url = f"{frontend_url}/security"

        subject = f"[InvestIQ Security Alert] {severity}: {title}"

        plain_body = f"""InvestIQ Security Alert Notification

Severity: {severity}
Alert Type: {alert_type}
Timestamp: {timestamp_str}

Description:
{description}

Action Required:
Please log in to your Security Center to review and acknowledge this alert:
{security_center_url}

InvestIQ SecOps Intelligence Pipeline
"""

        html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color: #0b0f19; font-family: sans-serif; color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px;">
    <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #38bdf8; margin-bottom: 12px;">INVESTIQ SECURITY DISPATCH</div>
    <h2 style="color: #f43f5e; margin-top: 0;">[{severity}] {title}</h2>
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">{description}</p>
    <div style="background: #090d16; padding: 12px; border-radius: 10px; font-size: 12px; color: #cbd5e1; margin: 16px 0;">
      <div><strong>Alert Type:</strong> {alert_type}</div>
      <div><strong>Timestamp:</strong> {timestamp_str}</div>
    </div>
    <a href="{security_center_url}" style="display: inline-block; background: #06b6d4; color: #090d16; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px;">Review in Security Center &rarr;</a>
  </div>
</body>
</html>"""

        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = from_email
            msg['To'] = target_email
            msg['Subject'] = subject
            msg.attach(MIMEText(plain_body, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))

            server = smtplib.SMTP(smtp_server, smtp_port, timeout=12)
            if smtp_use_tls:
                server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()

            # Update DB status
            alert_rec = db.session.get(SecurityAlert, alert_id)
            if alert_rec:
                alert_rec.email_dispatch_status = 'SENT_TO_SMTP'
                alert_rec.delivered_email = True
                db.session.commit()
            logger.info(f"[SECURITY ALERT EMAIL SENT TO SMTP] Alert '{alert_id}' sent to '{target_email}'.")
        except Exception as e:
            logger.warning(f"[SECURITY ALERT EMAIL FAILED] Alert '{alert_id}' failed: {str(e)}")
            try:
                alert_rec = db.session.get(SecurityAlert, alert_id)
                if alert_rec:
                    alert_rec.email_dispatch_status = 'FAILED'
                    alert_rec.delivered_email = False
                    db.session.commit()
            except Exception:
                db.session.rollback()
