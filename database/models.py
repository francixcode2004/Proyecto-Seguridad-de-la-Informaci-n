from datetime import datetime

from database import db


def mask_cedula(raw_cedula):
    cleaned = (raw_cedula or "").strip()
    if len(cleaned) <= 3:
        return cleaned
    return f"{cleaned[:2]}{'X' * (len(cleaned) - 3)}{cleaned[-1]}"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    cedula = db.Column(db.String(20), nullable=False)
    carrera = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "correo": self.correo,
            "cedula": mask_cedula(self.cedula),
            "carrera": self.carrera,
            "created_at": self.created_at.isoformat(),
        }


class RevokedToken(db.Model):
    __tablename__ = "revoked_tokens"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
