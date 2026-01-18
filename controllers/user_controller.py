import re

from flask import jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, jwt_required

from database import bcrypt, db
from database.models import RevokedToken, User

EMAIL_ALLOWED_DOMAINS = ("@est.ups.edu.ec", "@ups.edu.ec")
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$")


def register_user():
    payload = request.get_json(silent=True) or {}

    required_fields = {
        "nombre",
        "apellido",
        "correo",
        "contrasena",
        "cedula",
        "carrera",
    }

    missing_fields = required_fields.difference(payload.keys())
    if missing_fields:
        return jsonify({"message": "Campos requeridos faltantes", "faltantes": sorted(missing_fields)}), 400

    correo = (payload.get("correo") or "").lower().strip()
    contrasena = payload.get("contrasena") or ""

    if not correo.endswith(EMAIL_ALLOWED_DOMAINS):
        return jsonify({"message": "Correo no autorizado", "detalle": "Use dominio @est.ups.edu.ec o @ups.edu.ec"}), 400

    if not PASSWORD_PATTERN.fullmatch(contrasena):
        return jsonify({"message": "Contraseña inválida", "detalle": "Debe tener entre 8 y 12 caracteres alfanuméricos con al menos una letra y un número"}), 400

    existing_user = User.query.filter_by(correo=correo).first()
    if existing_user:
        return jsonify({"message": "El correo ya está registrado"}), 409

    password_hash = bcrypt.generate_password_hash(contrasena, rounds=10).decode("utf-8")

    user = User(
        nombre=payload.get("nombre").strip(),
        apellido=payload.get("apellido").strip(),
        correo=correo,
        password_hash=password_hash,
        cedula=str(payload.get("cedula")).strip(),
        carrera=payload.get("carrera").strip(),
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado", "usuario": user.to_dict()}), 201


def login_user():
    payload = request.get_json(silent=True) or {}

    correo = (payload.get("correo") or "").lower().strip()
    contrasena = payload.get("contrasena") or ""

    if not correo or not contrasena:
        return jsonify({"message": "Correo y contraseña son requeridos"}), 400

    user = User.query.filter_by(correo=correo).first()
    if not user:
        return jsonify({"message": "Credenciales inválidas"}), 401

    if not bcrypt.check_password_hash(user.password_hash, contrasena):
        return jsonify({"message": "Credenciales inválidas"}), 401

    additional_claims = {
        "correo": user.correo,
        "nombre": user.nombre,
    }
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)

    return jsonify({
        "message": "Inicio de sesión exitoso",
        "token": access_token,
        "usuario": user.to_dict(),
    }), 200


@jwt_required()
def logout_user():
    jti = get_jwt().get("jti")
    revoked = RevokedToken(jti=jti)
    db.session.add(revoked)
    db.session.commit()
    return jsonify({"message": "Sesión cerrada"}), 200
