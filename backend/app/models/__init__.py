from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .profile import FinancialProfile
from .recommendation import Recommendation
from .security import SecurityEvent, SecurityAlert, NotificationPreference

__all__ = [
    'db',
    'User',
    'FinancialProfile',
    'Recommendation',
    'SecurityEvent',
    'SecurityAlert',
    'NotificationPreference'
]
