import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from . import db
from ..utils.helpers import format_iso_utc

class SecurityEvent(db.Model):
    __tablename__ = 'security_events'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    severity = Column(String(20), nullable=False, default='LOW', index=True) # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    user_agent_raw = Column(String(255), nullable=True)
    endpoint = Column(String(150), nullable=True)
    method = Column(String(10), nullable=True)
    detection_status = Column(String(30), default='DETECTED', nullable=False) # 'DETECTED', 'ANALYZING', 'RESOLVED'
    response_action = Column(String(30), default='ALLOW', nullable=False)    # 'ALLOW', 'DENIED', 'THROTTLED', 'ALERT_GENERATED'
    alert_status = Column(String(30), default='NONE', nullable=False)       # 'NONE', 'PENDING', 'ACKNOWLEDGED'
    is_simulated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    alerts = relationship('SecurityAlert', backref='event', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'user_id': self.user_id,
            'severity': self.severity,
            'description': self.description,
            'ip_address': self.ip_address,
            'browser': self.browser,
            'os': self.os,
            'endpoint': self.endpoint,
            'method': self.method,
            'detection_status': self.detection_status,
            'response_action': self.response_action,
            'alert_status': self.alert_status,
            'is_simulated': self.is_simulated,
            'created_at': format_iso_utc(self.created_at),
            'metadata_notice': 'Browser and OS details inferred from client User-Agent and may be simulated/inaccurate.'
        }

class SecurityAlert(db.Model):
    __tablename__ = 'security_alerts'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey('security_events.id'), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default='MEDIUM')
    status = Column(String(30), default='PENDING', nullable=False, index=True) # 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'
    delivered_in_app = Column(Boolean, default=True, nullable=False)
    delivered_email = Column(Boolean, default=False, nullable=False)
    email_dispatch_status = Column(String(30), default='PENDING', nullable=False) # 'PENDING', 'SENT_TO_SMTP', 'FAILED', 'SKIPPED_PREFERENCE', 'SKIPPED_SIMULATED'
    admin_notes = Column(Text, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    is_simulated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'user_id': self.user_id,
            'alert_type': self.alert_type,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'delivered_in_app': self.delivered_in_app,
            'delivered_email': self.delivered_email,
            'email_dispatch_status': self.email_dispatch_status,
            'admin_notes': self.admin_notes,
            'acknowledged_by': self.acknowledged_by,
            'acknowledged_at': format_iso_utc(self.acknowledged_at),
            'is_simulated': self.is_simulated,
            'created_at': format_iso_utc(self.created_at)
        }

class NotificationPreference(db.Model):
    __tablename__ = 'notification_preferences'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    email_alerts_enabled = Column(Boolean, default=True, nullable=False)
    in_app_alerts_enabled = Column(Boolean, default=True, nullable=False)
    alert_severity_threshold = Column(String(20), default='LOW', nullable=False) # 'LOW', 'MEDIUM', 'HIGH'
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email_alerts_enabled': self.email_alerts_enabled,
            'in_app_alerts_enabled': self.in_app_alerts_enabled,
            'alert_severity_threshold': self.alert_severity_threshold
        }
