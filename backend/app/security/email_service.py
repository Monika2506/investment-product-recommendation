import smtplib
import logging
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

logger = logging.getLogger('investiq.email')

def send_recommendation_email(user, recommendation_data):
    """
    Asynchronously dispatches an investment recommendation HTML email notification
    to the user's registered Gmail address.
    Checks notification preferences and never blocks or fails the HTTP API request.
    """
    if not user or not user.email:
        logger.warning("[EMAIL NOTIFICATION] Aborted: No valid recipient email address.")
        return False

    # Check notification preference
    if hasattr(user, 'notification_pref') and user.notification_pref:
        if not user.notification_pref.email_alerts_enabled:
            logger.info(f"[EMAIL NOTIFICATION] Skipped for '{user.email}': User has disabled email notifications.")
            return False

    app = current_app._get_current_object()
    frontend_url = app.config.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    dashboard_url = f"{frontend_url}/dashboard"

    category = recommendation_data.get('recommended_category', 'Investment Portfolio')
    confidence = recommendation_data.get('confidence_score', 85.0)
    risk_category = recommendation_data.get('risk_category', 'Standard Risk')
    duration_summary = recommendation_data.get('duration_summary', 'Medium Horizon')

    subject = f"[InvestIQ] Your AI Investment Recommendation is Ready: {category}"

    # Plain text fallback
    plain_text = f"""Hello {user.full_name},

Your AI-powered investment product recommendation has been successfully synthesized by InvestIQ.

Primary Recommended Asset: {category}
Algorithmic Match Confidence: {confidence}%
Risk & Horizon Profile: {risk_category} ({duration_summary})

Please log in to your secured dashboard to review your complete suitability analysis:
{dashboard_url}

---
Strict Data Privacy Guarantee: InvestIQ never sends sensitive banking details, income, or card credentials via email.
Educational AI Model Demonstration - InvestIQ Intelligence Engine
"""

    # Midnight Finance Intelligence HTML Email Template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investment Recommendation Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid #1e293b;">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                            INVEST<span style="color: #06b6d4;">IQ</span>
                                        </div>
                                        <div style="font-size: 10px; text-transform: uppercase; tracking-widest: 2px; color: #94a3b8; margin-top: 2px; font-weight: 600;">
                                            Intelligence Engine &bull; Security Telemetry Active
                                        </div>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #22d3ee; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 10px; font-family: monospace;">
                                            AI MATCHED
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.3;">
                                Hello, <span style="color: #38bdf8;">{user.full_name}</span>
                            </h1>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                                Your financial profile and investment criteria have been evaluated by our Random Forest machine learning classification pipeline. Your personalized recommendation is ready for review.
                            </p>

                            <!-- Recommendation Card -->
                            <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; margin-bottom: 28px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #06b6d4; letter-spacing: 1px; margin-bottom: 6px;">
                                            Optimal Asset Category
                                        </div>
                                        <div style="font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">
                                            {category}
                                        </div>
                                        
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="50%" style="padding: 10px; background-color: #0f172a; border-radius: 10px; border: 1px solid #1e293b;">
                                                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Algorithmic Match</div>
                                                    <div style="font-size: 16px; font-weight: 800; color: #22d3ee; font-family: monospace; margin-top: 2px;">{confidence}%</div>
                                                </td>
                                                <td width="8"></td>
                                                <td width="50%" style="padding: 10px; background-color: #0f172a; border-radius: 10px; border: 1px solid #1e293b;">
                                                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Risk Category</div>
                                                    <div style="font-size: 13px; font-weight: 700; color: #c084fc; margin-top: 2px;">{risk_category}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{dashboard_url}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 100%); color: #090d16; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);">
                                            View Complete Recommendation &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Assurance Box -->
                            <div style="padding: 16px; background-color: #090d16; border: 1px solid #1e293b; border-radius: 12px; font-size: 12px; color: #64748b; line-height: 1.5;">
                                <strong style="color: #94a3b8;">Zero-Credential Data Privacy Guarantee:</strong> InvestIQ never includes sensitive bank account numbers, passwords, or personal income figures in email notifications. All data is protected with cross-tenant isolation and strict security controls.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
                            InvestIQ Investment Product Recommendation Engine &bull; Academic & Final-Year Evaluation Project<br>
                            To manage notification preferences, visit <a href="{dashboard_url}" style="color: #06b6d4; text-decoration: none;">Account Settings</a>.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""

    # Dispatch via background thread so HTTP thread is non-blocking
    thread = threading.Thread(
        target=_dispatch_smtp_email,
        args=(app, user.email, subject, plain_text, html_content),
        daemon=True
    )
    thread.start()
    return True

def _dispatch_smtp_email(app, recipient_email, subject, plain_text, html_content):
    """
    Internal worker to send SMTP email. Executed in a background thread.
    Gracefully handles missing credentials or connection timeouts.
    """
    with app.app_context():
        smtp_server = app.config.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = app.config.get('SMTP_PORT', 587)
        smtp_user = app.config.get('SMTP_USERNAME', '')
        smtp_pass = app.config.get('SMTP_PASSWORD', '')
        smtp_use_tls = app.config.get('SMTP_USE_TLS', True)
        from_email = app.config.get('ALERT_FROM_EMAIL') or smtp_user or 'notifications@investiq.local'

        if not smtp_user or not smtp_pass:
            logger.info(
                f"[EMAIL NOTIFICATION SIMULATED] To: {recipient_email} | "
                f"Subject: '{subject}' | Reason: SMTP_USERNAME or SMTP_PASSWORD not set in .env."
            )
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = from_email
            msg['To'] = recipient_email
            msg['Subject'] = subject

            msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            server = smtplib.SMTP(smtp_server, smtp_port, timeout=12)
            if smtp_use_tls:
                server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()

            logger.info(f"[EMAIL NOTIFICATION SENT SUCCESS] Email delivered to '{recipient_email}' via {smtp_server}:{smtp_port}.")
            return True
        except Exception as e:
            logger.warning(f"[EMAIL NOTIFICATION ERROR] Delivery failed to '{recipient_email}': {str(e)}")
            return False
