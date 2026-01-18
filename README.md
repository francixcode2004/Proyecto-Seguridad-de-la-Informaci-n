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

### Cómo usar `/api/auth/logout`

- Envía una petición POST sin cuerpo.
- Agrega el encabezado `Authorization: Bearer <token>` con el token devuelto por el login.
- Tras cerrar sesión el token queda revocado, por lo que nuevos usos devolverán `Token inválido`.

## Reglas de validación y seguridad

- Solo se aceptan correos con dominios `@est.ups.edu.ec` o `@ups.edu.ec`.
- La contraseña debe ser alfanumérica, de 8 a 12 caracteres, con al menos una letra y un número.
- Las contraseñas se guardan con hash Bcrypt y 10 rondas de salt, nunca en texto plano.
- La cédula se almacena completa en base de datos pero se expone enmascarada (ej. `17XXXXXXX5`) en las respuestas JSON.

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

### Logout (respuesta)

```json
{
    "message": "Sesión cerrada"
}
```
