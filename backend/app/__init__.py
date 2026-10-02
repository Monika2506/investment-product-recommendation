import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from .config import Config
from .models import db
from .utils.helpers import error_response, success_response

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"]
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Database
    db.init_app(app)

    # Initialize CORS for frontend Vite dev server and production
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Initialize Rate Limiter
    limiter.init_app(app)

    # Register Blueprints
    from .routes import auth_bp, profile_bp, recommend_bp, security_bp, admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(recommend_bp)
    app.register_blueprint(security_bp)
    app.register_blueprint(admin_bp)

    # Root & Health Check Endpoints
    @app.route('/', methods=['GET'])
    def root_index():
        return success_response({
            'status': 'online',
            'service': 'InvestIQ Python Flask Backend API Server',
            'frontend_url': app.config.get('FRONTEND_URL', 'http://localhost:5173'),
            'message': 'Backend REST API is running successfully. To open the InvestIQ web application interface, visit the frontend URL.'
        })

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return success_response({
            'status': 'healthy',
            'service': 'Investment Product Recommendation API',
            'version': '1.0.0'
        })

    # Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return error_response(str(e.description) if hasattr(e, 'description') else "Bad request.", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response("Authentication required.", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return error_response("Access forbidden.", 403)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("API endpoint or resource not found.", 404)

    @app.errorhandler(429)
    def ratelimit_handler(e):
        from .security.event_logger import log_security_event
        log_security_event(
            event_type='RATE_LIMIT_EXCEEDED',
            description=f"Rate limit exceeded on endpoint '{request.path}'. Client temporarily throttled.",
            severity='MEDIUM',
            response_action='THROTTLED',
            create_alert=True,
            alert_title="API Rate Limit Exceeded: Client Throttled"
        )
        return error_response(f"Too many requests: {e.description}. Please slow down.", 429)

    @app.errorhandler(500)
    def server_error(e):
        return error_response("Internal server error. Our engineering team has logged this incident.", 500)

    # Create tables if not existing and perform safe column migration for SQLite
    with app.app_context():
        db.create_all()
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if 'security_alerts' in inspector.get_table_names():
                columns = [c['name'] for c in inspector.get_columns('security_alerts')]
                if 'email_dispatch_status' not in columns:
                    db.session.execute(text("ALTER TABLE security_alerts ADD COLUMN email_dispatch_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL"))
                    db.session.commit()
        except Exception:
            db.session.rollback()

    return app
