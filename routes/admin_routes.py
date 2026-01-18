from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.admin_controller import (
    delete_laboratory,
    delete_user,
    list_laboratories,
    list_users,
    update_laboratory,
    update_user,
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def admin_list_users():
    return list_users()


@admin_bp.route("/users/<int:user_id>", methods=["PATCH"])
@jwt_required()
def admin_update_user(user_id):
    return update_user(user_id)


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_user(user_id):
    return delete_user(user_id)


@admin_bp.route("/laboratories", methods=["GET"])
@jwt_required()
def admin_list_laboratories():
    return list_laboratories()


@admin_bp.route("/laboratories/<int:request_id>", methods=["PATCH"])
@jwt_required()
def admin_update_laboratory(request_id):
    return update_laboratory(request_id)


@admin_bp.route("/laboratories/<int:request_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_laboratory(request_id):
    return delete_laboratory(request_id)
