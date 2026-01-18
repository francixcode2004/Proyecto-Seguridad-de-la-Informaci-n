import unicodedata
from datetime import datetime

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
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
from database import db
from database.models import LaboratoryRequest, User
REQUIRED_FIELDS = {
    "correo_institucional",
    "nombres_completos",
    "cargo",
    "carrera",
    "nivel",
    "discapacidad",
    "materia_motivo",
    "numero_estudiantes",
    "fecha_prestamo",
    "horario_uso",
    "descripcion_actividades",
    "laboratorio",
    "equipo",
}


def _normalize(text_value):
    normalized = unicodedata.normalize("NFKD", text_value or "")
    return "".join(char for char in normalized if not unicodedata.combining(char)).strip().upper()


def _validate_choice(payload_value, options, field_name):
    key = _normalize(payload_value)
    if key not in options:
        return None, jsonify({
            "message": f"Valor no permitido para {field_name}",
            "permitidos": sorted(options.values()),
        }), 400
    return options[key], None


def create_laboratory_request():
    payload = request.get_json(silent=True) or {}

    missing_fields = REQUIRED_FIELDS.difference(payload.keys())
    if missing_fields:
        return jsonify({"message": "Campos requeridos faltantes", "faltantes": sorted(missing_fields)}), 400

    correo = (payload.get("correo_institucional") or "").lower().strip()
    if not correo.endswith(EMAIL_ALLOWED_DOMAINS):
        return jsonify({"message": "Correo institucional inválido", "detalle": "Debe pertenecer a @est.ups.edu.ec o @ups.edu.ec"}), 400

    cargo, error = _validate_choice(payload.get("cargo"), CARGO_OPTIONS, "cargo")
    if error:
        return error

    carrera, error = _validate_choice(payload.get("carrera"), CARRERA_OPTIONS, "carrera")
    if error:
        return error

    nivel, error = _validate_choice(payload.get("nivel"), NIVEL_OPTIONS, "nivel")
    if error:
        return error

    discapacidad, error = _validate_choice(payload.get("discapacidad"), DISCAPACIDAD_OPTIONS, "discapacidad")
    if error:
        return error

    laboratorio, error = _validate_choice(payload.get("laboratorio"), LABORATORIO_OPTIONS, "laboratorio")
    if error:
        return error

    equipo, error = _validate_choice(payload.get("equipo"), EQUIPO_OPTIONS, "equipo")
    if error:
        return error

    nombres = (payload.get("nombres_completos") or "").strip()
    materia_motivo = (payload.get("materia_motivo") or "").strip()
    descripcion = (payload.get("descripcion_actividades") or "").strip()
    horario = (payload.get("horario_uso") or "").strip()

    if not nombres or not materia_motivo or not descripcion or not horario:
        return jsonify({"message": "Los campos de texto no pueden estar vacíos"}), 400

    if not HORARIO_PATTERN.fullmatch(horario):
        return jsonify({"message": "Formato de horario inválido", "detalle": "Use HH:MM - HH:MM"}), 400

    try:
        numero_estudiantes = int(payload.get("numero_estudiantes"))
    except (TypeError, ValueError):
        return jsonify({"message": "Número de estudiantes inválido"}), 400

    if numero_estudiantes <= 0:
        return jsonify({"message": "El número de estudiantes debe ser mayor que cero"}), 400

    if numero_estudiantes > MAX_ESTUDIANTES:
        return jsonify({"message": "Número de estudiantes excede la capacidad", "maximo": MAX_ESTUDIANTES}), 400

    try:
        fecha_prestamo = datetime.strptime(payload.get("fecha_prestamo"), DATE_FORMAT).date()
    except (TypeError, ValueError):
        return jsonify({"message": "Fecha de préstamo inválida", "detalle": "Use formato d/m/yyyy"}), 400

    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return jsonify({"message": "Identidad de usuario inválida"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    existing_request = LaboratoryRequest.query.filter_by(
        laboratorio=laboratorio,
        fecha_prestamo=fecha_prestamo,
        horario_uso=horario,
    ).first()
    if existing_request:
        return jsonify({
            "message": "Horario ya reservado",
            "detalle": "Existe una solicitud aprobada para el mismo laboratorio, fecha y horario",
        }), 409

    request_record = LaboratoryRequest(
        user_id=user_id,
        correo_institucional=correo,
        nombres_completos=nombres,
        cargo=cargo,
        carrera=carrera,
        nivel=nivel,
        discapacidad=discapacidad,
        materia_motivo=materia_motivo,
        numero_estudiantes=numero_estudiantes,
        fecha_prestamo=fecha_prestamo,
        horario_uso=horario,
        descripcion_actividades=descripcion,
        laboratorio=laboratorio,
        equipo=equipo,
    )

    db.session.add(request_record)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "Horario ya reservado",
            "detalle": "Conflicto detectado con otra solicitud simultanea",
        }), 409

    return jsonify({"message": "Solicitud registrada", "solicitud": request_record.to_dict()}), 201
