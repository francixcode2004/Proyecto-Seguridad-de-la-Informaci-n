from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.laboratory_controller import create_laboratory_request
from controllers.user_controller import login_user, logout_user, register_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    return register_user()


@auth_bp.route("/login", methods=["POST"])
def login():
    return login_user()


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return logout_user()


@auth_bp.route("/laboratory", methods=["POST"])
@jwt_required()
def laboratory_request():
    return create_laboratory_request()
