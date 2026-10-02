from .auth_routes import auth_bp
from .profile_routes import profile_bp
from .recommend_routes import recommend_bp
from .security_routes import security_bp
from .admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'profile_bp',
    'recommend_bp',
    'security_bp',
    'admin_bp'
]
