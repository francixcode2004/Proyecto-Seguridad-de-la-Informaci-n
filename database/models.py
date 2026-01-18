from datetime import datetime

from database import db


def mask_cedula(raw_cedula):
    cleaned = (raw_cedula or "").strip()
    if len(cleaned) <= 3:
        return cleaned
    return f"{cleaned[:2]}{'X' * (len(cleaned) - 3)}{cleaned[-1]}"


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
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
            "password": "********",
        }


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


class LaboratoryRequest(db.Model):
    __tablename__ = "laboratory_requests"
    __table_args__ = (
        db.UniqueConstraint("laboratorio", "fecha_prestamo", "horario_uso", name="uq_lab_schedule"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    correo_institucional = db.Column(db.String(150), nullable=False)
    nombres_completos = db.Column(db.String(150), nullable=False)
    cargo = db.Column(db.String(40), nullable=False)
    carrera = db.Column(db.String(50), nullable=False)
    nivel = db.Column(db.String(20), nullable=False)
    discapacidad = db.Column(db.String(2), nullable=False)
    materia_motivo = db.Column(db.String(255), nullable=False)
    numero_estudiantes = db.Column(db.Integer, nullable=False)
    fecha_prestamo = db.Column(db.Date, nullable=False)
    horario_uso = db.Column(db.String(35), nullable=False)
    descripcion_actividades = db.Column(db.Text, nullable=False)
    laboratorio = db.Column(db.String(80), nullable=False)
    equipo = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship(
        "User",
        backref=db.backref("laboratory_requests", lazy=True, cascade="all, delete-orphan"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.user_id,
            "correo_institucional": self.correo_institucional,
            "nombres_completos": self.nombres_completos,
            "cargo": self.cargo,
            "carrera": self.carrera,
            "nivel": self.nivel,
            "discapacidad": self.discapacidad,
            "materia_motivo": self.materia_motivo,
            "numero_estudiantes": self.numero_estudiantes,
            "fecha_prestamo": self.fecha_prestamo.isoformat(),
            "horario_uso": self.horario_uso,
            "descripcion_actividades": self.descripcion_actividades,
            "laboratorio": self.laboratorio,
            "equipo": self.equipo,
            "created_at": self.created_at.isoformat(),
        }
