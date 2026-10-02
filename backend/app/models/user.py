from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from . import db

from ..utils.helpers import format_iso_utc

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default='user', nullable=False)  # 'user' or 'admin'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)

    # Relationships
    profile = relationship('FinancialProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    recommendations = relationship('Recommendation', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    security_events = relationship('SecurityEvent', backref='user', lazy='dynamic')
    security_alerts = relationship('SecurityAlert', foreign_keys='SecurityAlert.user_id', backref='user', lazy='dynamic')
    notification_pref = relationship('NotificationPreference', backref='user', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': format_iso_utc(self.created_at),
            'last_login_at': format_iso_utc(self.last_login_at),
            'has_profile': bool(self.profile)
        }
        if include_sensitive:
            data['last_login_ip'] = self.last_login_ip
        return data
