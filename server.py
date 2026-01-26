import os
import sys
from datetime import timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS  # IMPORTANTE
from flask_jwt_extended import get_jwt_identity

from database import db, bcrypt, jwt
from config.logger import log_endpoint_transaction


def _run_startup_tests():
    if os.environ.get("SKIP_STARTUP_TESTS"):
        print("⚠️  Startup tests skippeados por configuración de entorno.")
        return True

    try:
        import pytest  # pylint: disable=import-error
    except ImportError:
        print("⚠️  Pytest no está instalado; omitiendo pruebas automáticas.")
        return True

    print("🔍 Ejecutando pruebas automáticas antes de iniciar el servidor...\n")
    exit_code = pytest.main(["-q"])  # Ejecuta toda la suite en modo silencioso

    if exit_code == 0:
        print("✅ test 1 base de datos creada")
        print("✅ test 2 flujo reservas usuarios")
        print("✅ test 3 administración de usuarios y laboratorios")
        print("\nTodas las pruebas pasaron correctamente. Iniciando servidor...\n")
        return True

    print("❌ Las pruebas automáticas fallaron. Revisa la salida anterior.")
    return False


def create_app():
    app = Flask(__name__)

    # CORS (AQUÍ, antes de blueprints)
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True
    )

    base_dir = os.path.abspath(os.path.dirname(__file__))
    default_db_path = os.path.join(base_dir, "database", "app.db")
    database_url = os.environ.get("DATABASE_URL") or f"sqlite:///{default_db_path}"

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "cambie-esta-clave")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_DECODE_SUBJECT"] = False

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from database.models import RevokedToken

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload.get("jti")
        token = RevokedToken.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"message": "Token inválido", "reason": reason}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"message": "Token requerido", "reason": reason}), 401

    from routes.admin_routes import admin_bp
    from routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.after_request
    def register_transaction(response):
        if request.path.startswith("/api/"):
            identity = None
            try:
                identity_value = get_jwt_identity()
                if identity_value:
                    identity = str(identity_value)
            except Exception:
                identity = None

            log_endpoint_transaction(
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                identity=identity,
                remote_addr=request.remote_addr,
                endpoint=request.endpoint,
            )
        return response

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    if not _run_startup_tests():
        sys.exit(1)

    flask_app = create_app()
    flask_app.run(debug=True)