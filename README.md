# Proyecto Flask con JWT y SQLite

## Estructura del proyecto

```
.
├── main.py
├── README.md
├── controllers
│   ├── __init__.py
│   └── user_controller.py
├── routes
│   ├── __init__.py
│   └── auth_routes.py
└── database
    ├── __init__.py
    ├── app.db
    └── models.py
```

## Instalación rápida

```bash
python -m venv venv
venv\Scripts\activate
pip install Flask Flask-SQLAlchemy Flask-Bcrypt Flask-JWT-Extended
set JWT_SECRET_KEY="cambie-esta-clave"
python main.py
```

## Endpoints principales

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- POST `/api/auth/laboratory` (requiere token válido)

### Cómo usar `/api/auth/logout`

- Envía una petición POST sin cuerpo.
- Agrega el encabezado `Authorization: Bearer <token>` con el token devuelto por el login.
- Tras cerrar sesión el token queda revocado, por lo que nuevos usos devolverán `Token inválido`.

## Reglas de validación y seguridad

- Solo se aceptan correos con dominios `@est.ups.edu.ec` o `@ups.edu.ec`.
- La contraseña debe ser alfanumérica, de 8 a 12 caracteres, con al menos una letra y un número.
- Las contraseñas se guardan con hash Bcrypt y 10 rondas de salt, nunca en texto plano.
- La cédula se almacena completa en base de datos pero se expone enmascarada (ej. `17XXXXXXX5`) en las respuestas JSON.
- El préstamo de laboratorios valida cargos, carreras, niveles, laboratorios y equipos permitidos, además de formatos de fecha (`d/m/yyyy`) y horario (`HH:MM - HH:MM`).
- Cada laboratorio admite como máximo 35 estudiantes por solicitud y se rechazan reservas simultáneas con el mismo laboratorio, fecha y horario.

### Configuración adicional

- Los catálogos de `cargo`, `carrera`, `nivel`, `laboratorio` y `equipo`, junto al límite de estudiantes (`MAX_ESTUDIANTES`), pueden ajustarse en controllers/laboratory_controller.py.
- La protección contra reservas duplicadas se garantiza con la restricción única declarada en database/models.py (`uq_lab_schedule`), por lo que cualquier cambio en la estructura debe respetar esa integridad.

## Ejemplos de JSON

### Registro (envío)

```json
{
    "nombre": "Francisco",
    "apellido": "Perez",
    "correo": "fran@est.ups.edu.ec",
    "contrasena": "Q12444545666",
    "cedula": "0102345678",
    "carrera": "Ingeniería de Sistemas"
}
```

### Registro (respuesta)

```json
{
    "message": "Usuario registrado",
    "usuario": {
        "id": 1,
        "nombre": "Francisco",
        "apellido": "Perez",
        "correo": "fran@est.ups.edu.ec",
        "cedula": "17XXXXXXX5",
        "carrera": "Ingeniería de Sistemas",
        "created_at": "2026-01-18T12:34:56.789123"
    }
}
```

### login envio

```json
{
    "correo": "fran@est.ups.edu.ec",
    "contrasena": "Q12444545666"
}
```

### login devuelve

```json
{
    "message": "Inicio de sesión exitoso",
    "token": "jwt-token-aqui",
    "usuario": {
        "id": 1,
        "nombre": "Francisco",
        "apellido": "Perez",
        "correo": "fran@est.ups.edu.ec",
        "cedula": "17XXXXXXX5",
        "carrera": "Ingeniería de Sistemas",
        "created_at": "2026-01-18T12:34:56.789123"
    }
}
```

### Laboratory (envío)

```json
{
    "correo_institucional": "fran@est.ups.edu.ec",
    "nombres_completos": "Francisco Perez",
    "cargo": "Estudiante",
    "carrera": "Computacion",
    "nivel": "8vo",
    "discapacidad": "NO",
    "materia_motivo": "Redes Avanzadas",
    "numero_estudiantes": 5,
    "fecha_prestamo": "25/1/2026",
    "horario_uso": "08:00 - 10:00",
    "descripcion_actividades": "Configuracion de topologias y pruebas de conectividad",
    "laboratorio": "Laboratorio Networking 3",
    "equipo": "Router 2800"
}
```

### Laboratory (respuesta)

```json
{
  "message": "Solicitud registrada",
  "solicitud": {
    "cargo": "Estudiante",
    "carrera": "Computacion",
    "correo_institucional": "fran@est.ups.edu.ec",
    "created_at": "2026-01-18T23:06:47.571938",
    "descripcion_actividades": "Configuracion de topologias y pruebas de conectividad",
    "discapacidad": "NO",
    "equipo": "Router 2800",
    "fecha_prestamo": "2026-01-25",
    "horario_uso": "08:00 - 10:00",
    "id": 1,
    "laboratorio": "Laboratorio Networking 3",
    "materia_motivo": "Redes Avanzadas",
    "nivel": "8vo",
    "nombres_completos": "Francisco Perez",
    "numero_estudiantes": 5,
    "usuario_id": 1
  }
}
```

### Logout (respuesta)

```json
{
    "message": "Sesión cerrada"
}
```
