import re
import unicodedata
from datetime import datetime

from flask import jsonify, request
from flask_jwt_extended import create_access_token, get_jwt
from sqlalchemy.exc import IntegrityError

from config.options import (
    CARGO_OPTIONS,
    CARRERA_OPTIONS,
    DATE_FORMAT,
    DISCAPACIDAD_OPTIONS,
    EMAIL_ALLOWED_DOMAINS,
    EQUIPO_OPTIONS,
    HORARIO_PATTERN,
    LABORATORIO_OPTIONS,
    MAX_ESTUDIANTES,
    NIVEL_OPTIONS,
)
from database import bcrypt, db
from database.models import Admin, LaboratoryRequest, User

EMAIL_ALLOWED_DOMAINS = ("@est.ups.edu.ec", "@ups.edu.ec")
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$")
MASKED_PASSWORD = "********"
ADMIN_REQUIRED_FIELDS = {
    "nombre",
    "apellido",
    "correo",
    "contrasena",
    "cedula",
    "carrera",
    "admin",
}


def _require_admin_claim():
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"message": "Acceso solo para administradores"}), 403
    return None


def _mask_user_record(user):
    data = user.to_dict()
    data["password"] = MASKED_PASSWORD
    return data


def _normalize_choice(value):
    normalized = unicodedata.normalize("NFKD", value or "")
    return "".join(char for char in normalized if not unicodedata.combining(char)).strip().upper()


def login_admin():
    payload = request.get_json(silent=True) or {}

    correo = (payload.get("correo") or "").lower().strip()
    contrasena = payload.get("contrasena") or ""

    if not correo or not contrasena:
        return jsonify({"message": "Correo y contraseña son requeridos"}), 400

    admin = Admin.query.filter_by(correo=correo).first()
    if not admin:
        return jsonify({"message": "Credenciales inválidas"}), 401

    if not bcrypt.check_password_hash(admin.password_hash, contrasena):
        return jsonify({"message": "Credenciales inválidas"}), 401

    additional_claims = {
        "correo": admin.correo,
        "nombre": admin.nombre,
        "is_admin": True,
    }
    access_token = create_access_token(identity=f"admin:{admin.id}", additional_claims=additional_claims)

    return jsonify({
        "message": "Inicio de sesión administrador exitoso",
        "token": access_token,
        "administrador": admin.to_dict(),
    }), 200


def register_admin():
    payload = request.get_json(silent=True) or {}

    missing = ADMIN_REQUIRED_FIELDS.difference(payload.keys())
    if missing:
        return jsonify({"message": "Campos requeridos faltantes", "faltantes": sorted(missing)}), 400

    if not payload.get("admin"):
        return jsonify({"message": "Debe establecer admin en true"}), 400

    correo = (payload.get("correo") or "").lower().strip()
    contrasena = payload.get("contrasena") or ""

    if not correo.endswith(EMAIL_ALLOWED_DOMAINS):
        return jsonify({"message": "Correo no autorizado", "detalle": "Use dominio @est.ups.edu.ec o @ups.edu.ec"}), 400

    if not PASSWORD_PATTERN.fullmatch(contrasena):
        return jsonify({"message": "Contraseña inválida", "detalle": "Debe tener entre 8 y 12 caracteres alfanuméricos"}), 400

    existing_admin = Admin.query.filter_by(correo=correo).first()
    if existing_admin:
        return jsonify({"message": "El correo ya está registrado en administradores"}), 409

    password_hash = bcrypt.generate_password_hash(contrasena, rounds=10).decode("utf-8")

    admin = Admin(
        nombre=payload.get("nombre").strip(),
        apellido=payload.get("apellido").strip(),
        correo=correo,
        password_hash=password_hash,
        cedula=str(payload.get("cedula")).strip(),
        carrera=payload.get("carrera").strip(),
    )

    db.session.add(admin)
    db.session.commit()

    response = admin.to_dict()
    response["admin"] = True

    return jsonify({
        "message": "Administrador registrado",
        "administrador": response,
    }), 201


def list_users():
    error = _require_admin_claim()
    if error:
        return error

    users = User.query.order_by(User.created_at.desc()).all()

    return jsonify({
        "usuarios": [_mask_user_record(user) for user in users],
        "total": len(users),
    }), 200


def update_user(user_id):
    error = _require_admin_claim()
    if error:
        return error

    payload = request.get_json(silent=True) or {}

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    correo = payload.get("correo")
    if correo is not None:
        correo_normalized = correo.lower().strip()
        if not correo_normalized.endswith(EMAIL_ALLOWED_DOMAINS):
            return jsonify({"message": "Correo no autorizado"}), 400
        existing = User.query.filter(User.correo == correo_normalized, User.id != user.id).first()
        if existing:
            return jsonify({"message": "El correo ya está registrado"}), 409
        user.correo = correo_normalized

    if "nombre" in payload and payload.get("nombre"):
        user.nombre = payload["nombre"].strip()

    if "apellido" in payload and payload.get("apellido"):
        user.apellido = payload["apellido"].strip()

    if "cedula" in payload and payload.get("cedula"):
        user.cedula = str(payload["cedula"]).strip()

    if "carrera" in payload and payload.get("carrera"):
        user.carrera = payload["carrera"].strip()

    contrasena = payload.get("contrasena")
    if contrasena:
        if not PASSWORD_PATTERN.fullmatch(contrasena):
            return jsonify({"message": "Contraseña inválida"}), 400
        user.password_hash = bcrypt.generate_password_hash(contrasena, rounds=10).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "Usuario actualizado", "usuario": _mask_user_record(user)}), 200


def delete_user(user_id):
    error = _require_admin_claim()
    if error:
        return error

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado"}), 200


def list_laboratories():
    error = _require_admin_claim()
    if error:
        return error

    requests = LaboratoryRequest.query.order_by(LaboratoryRequest.created_at.desc()).all()
    return jsonify({
        "reservas": [req.to_dict() for req in requests],
        "total": len(requests),
    }), 200


def update_laboratory(request_id):
    error = _require_admin_claim()
    if error:
        return error

    payload = request.get_json(silent=True) or {}

    lab_request = LaboratoryRequest.query.get(request_id)
    if not lab_request:
        return jsonify({"message": "Reserva no encontrada"}), 404

    if "correo_institucional" in payload:
        correo = (payload.get("correo_institucional") or "").lower().strip()
        if not correo.endswith(EMAIL_ALLOWED_DOMAINS):
            return jsonify({"message": "Correo institucional inválido"}), 400
        lab_request.correo_institucional = correo

    def _apply_choice(field, options):
        if field in payload:
            key = _normalize_choice(payload[field])
            value = options.get(key)
            if not value:
                return jsonify({
                    "message": f"Valor no permitido para {field}",
                    "permitidos": sorted(options.values()),
                }), 400
            setattr(lab_request, field if field != "laboratorio" else "laboratorio", value)
        return None

    for field, options in (
        ("cargo", CARGO_OPTIONS),
        ("carrera", CARRERA_OPTIONS),
        ("nivel", NIVEL_OPTIONS),
        ("discapacidad", DISCAPACIDAD_OPTIONS),
        ("laboratorio", LABORATORIO_OPTIONS),
        ("equipo", EQUIPO_OPTIONS),
    ):
        error_resp = _apply_choice(field, options)
        if error_resp:
            return error_resp

    if "nombres_completos" in payload and payload.get("nombres_completos"):
        lab_request.nombres_completos = payload["nombres_completos"].strip()

    if "materia_motivo" in payload and payload.get("materia_motivo"):
        lab_request.materia_motivo = payload["materia_motivo"].strip()

    if "descripcion_actividades" in payload and payload.get("descripcion_actividades"):
        lab_request.descripcion_actividades = payload["descripcion_actividades"].strip()

    if "horario_uso" in payload:
        horario = payload.get("horario_uso") or ""
        if not HORARIO_PATTERN.fullmatch(horario.strip()):
            return jsonify({"message": "Formato de horario inválido"}), 400
        lab_request.horario_uso = horario.strip()

    if "numero_estudiantes" in payload:
        try:
            numero_estudiantes = int(payload.get("numero_estudiantes"))
        except (TypeError, ValueError):
            return jsonify({"message": "Número de estudiantes inválido"}), 400
        if numero_estudiantes <= 0:
            return jsonify({"message": "El número de estudiantes debe ser mayor que cero"}), 400
        if numero_estudiantes > MAX_ESTUDIANTES:
            return jsonify({"message": "Número de estudiantes excede la capacidad", "maximo": MAX_ESTUDIANTES}), 400
        lab_request.numero_estudiantes = numero_estudiantes

    if "fecha_prestamo" in payload:
        try:
            lab_request.fecha_prestamo = datetime.strptime(payload.get("fecha_prestamo"), DATE_FORMAT).date()
        except (TypeError, ValueError):
            return jsonify({"message": "Fecha de préstamo inválida"}), 400

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "Horario ya reservado",
            "detalle": "Conflicto detectado con otra solicitud",
        }), 409

    return jsonify({"message": "Reserva actualizada", "reserva": lab_request.to_dict()}), 200


def delete_laboratory(request_id):
    error = _require_admin_claim()
    if error:
        return error

    lab_request = LaboratoryRequest.query.get(request_id)
    if not lab_request:
        return jsonify({"message": "Reserva no encontrada"}), 404

    db.session.delete(lab_request)
    db.session.commit()
    return jsonify({"message": "Reserva eliminada"}), 200
