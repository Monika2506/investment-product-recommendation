import os
from datetime import timedelta
from sqlalchemy.pool import StaticPool

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(BASE_DIR), '.env')
    if not os.path.exists(env_path):
        env_path = os.path.join(BASE_DIR, '.env')
    load_dotenv(env_path)
except Exception:
    pass

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'investiq-secret-key-production-change-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

    # Frontend URL for email action links
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')

    # Database
    db_path = os.path.join(BASE_DIR, 'investment_app.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security Thresholds
    FAILED_LOGIN_LIMIT = int(os.environ.get('FAILED_LOGIN_LIMIT', 3))
    FAILED_LOGIN_WINDOW_MINUTES = int(os.environ.get('FAILED_LOGIN_WINDOW_MINUTES', 5))
    
    # Rate Limiting
    RATELIMIT_DEFAULT = os.environ.get('RATELIMIT_DEFAULT', "200 per minute")
    RATELIMIT_STORAGE_URI = "memory://"

    # SMTP Configuration for Gmail / Custom Mail Server
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'true').lower() == 'true'
    ALERT_FROM_EMAIL = os.environ.get('ALERT_FROM_EMAIL', os.environ.get('SMTP_USERNAME', 'notifications@investiq.local'))
    ADMIN_NOTIFICATION_EMAIL = os.environ.get('ADMIN_NOTIFICATION_EMAIL', 'admin@investiq.local')

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {'check_same_thread': False},
        'poolclass': StaticPool
    }
    WTF_CSRF_ENABLED = False
