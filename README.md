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

## Guía de endpoints

Cada ruta expone validaciones específicas para garantizar integridad de datos y seguridad. A continuación se detalla el objetivo, las restricciones y los ejemplos que debe consumir el equipo de Front.

### POST `/api/auth/register` (público)
- **Objetivo:** registra usuarios finales (estudiantes, docentes, egresados) y devuelve sus datos enmascarando la cédula.
- **Autenticación:** no requerida.
- **Restricciones:**
    - `correo` debe terminar en `@est.ups.edu.ec` o `@ups.edu.ec` y ser único.
    - `contrasena` debe ser alfanumérica, 8-12 caracteres, mínimo una letra y un número; se guarda con Bcrypt (10 rondas).
    - `cedula` se almacena completa pero se responde enmascarada.
- **Respuesta:** HTTP 201 con el usuario creado; ID autogenerado y campos de auditoría (`created_at`).

#### Ejemplo de solicitud

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

#### Ejemplo de respuesta

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

### POST `/api/auth/login` (público)
- **Objetivo:** entrega un JWT válido por 1 hora para usuarios finales.
- **Autenticación:** credenciales válidas de usuario (`correo`, `contrasena`).
- **Restricciones:**
    - Requiere que la cuenta exista y la contraseña coincida con el hash almacenado.
    - El JWT incluye `identity` (ID de usuario) y claims adicionales (`correo`, `nombre`).
- **Respuesta:** HTTP 200 con token y datos del usuario enmascarados.

#### Ejemplo de solicitud

```json
{
        "correo": "fran@est.ups.edu.ec",
        "contrasena": "Q12444545666"
}
```

#### Ejemplo de respuesta

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

### POST `/api/auth/logout` (requiere token de usuario)
- **Objetivo:** invalida un token JWT agregándolo a la blocklist.
- **Autenticación:** encabezado `Authorization: Bearer <token>`.
- **Restricciones:**
    - No requiere cuerpo.
    - Devuelve error 401 si el token está ausente, vencido o ya revocado.
- **Respuesta:** HTTP 200 con mensaje de confirmación.

#### Ejemplo de solicitud

```
Authorization: Bearer <token>
```

```json
{
        "message": "Sesión cerrada"
}
```

### POST `/api/auth/register-admin` (público controlado)
- **Objetivo:** registrar cuentas administrativas con los mismos campos que los usuarios, más un `admin` obligatorio igual a `true`.
- **Autenticación:** no requerida (usar solo en fase de aprovisionamiento).
- **Restricciones:**
    - Mismas validaciones de correo y contraseña que `/register`.
    - `admin` debe ser `true`; de lo contrario se rechaza la petición.
    - Correo debe ser único en la tabla de administradores.
- **Respuesta:** HTTP 201 con datos del administrador (cédula enmascarada, contraseña oculta).

#### Ejemplo de solicitud

```json
{
        "nombre": "Francisco",
        "apellido": "Perez",
        "correo": "fran2@est.ups.edu.ec",
        "contrasena": "Q12444545668",
        "cedula": "0102345678",
        "carrera": "Ingeniería de Sistemas",
        "admin": true
}
```

#### Ejemplo de respuesta

```json
{
        "message": "Administrador registrado",
        "administrador": {
                "id": 1,
                "nombre": "Francisco",
                "apellido": "Perez",
                "correo": "fran2@est.ups.edu.ec",
                "cedula": "17XXXXXXX5",
                "carrera": "Ingeniería de Sistemas",
                "created_at": "2026-01-18T12:34:56.789123",
                "password": "********",
                "admin": true
        }
}
```

### POST `/api/auth/login-admin` (público)
- **Objetivo:** autenticar administradores y emitir un JWT con la claim `is_admin=true` para controlar accesos.
- **Autenticación:** credenciales del administrador registrado.
- **Restricciones:**
    - El correo debe existir en la tabla `admins`.
    - Contraseña verificada contra hash Bcrypt.
- **Respuesta:** HTTP 200 con token y datos básicos del administrador.

#### Ejemplo de solicitud

```json
{
        "correo": "admin@ups.edu.ec",
        "contrasena": "Admin1234"
}
```

#### Ejemplo de respuesta

```json
{
        "message": "Inicio de sesión administrador exitoso",
        "token": "jwt-admin-token",
        "administrador": {
                "id": 1,
                "nombre": "Administrador UPS",
                "correo": "admin@ups.edu.ec",
                "created_at": "2026-01-18T12:34:56.789123",
                "password": "********"
        }
}
```

### POST `/api/auth/laboratory` (requiere token de usuario)
- **Objetivo:** registrar solicitudes de préstamo para laboratorios del bloque D.
- **Autenticación:** JWT de usuario (`Authorization: Bearer <token>`).
- **Restricciones principales:**
    - `correo_institucional` debe usar los dominios institucionales válidos.
    - Campos de selección (`cargo`, `carrera`, `nivel`, `discapacidad`, `laboratorio`, `equipo`) aceptan únicamente valores configurados en `config/options.py`.
    - `fecha_prestamo` usa formato `d/m/yyyy`; `horario_uso` debe seguir `HH:MM - HH:MM`.
    - `numero_estudiantes` > 0 y ≤ 35.
    - No permite reservas simultáneas para mismo laboratorio, fecha y horario (conflicto 409).
- **Respuesta:** HTTP 201 con la reserva creada.

#### Ejemplo de solicitud

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

#### Ejemplo de respuesta

```json
{
    "message": "Solicitud registrada",
    "solicitud": {
        "id": 1,
        "usuario_id": 1,
        "correo_institucional": "fran@est.ups.edu.ec",
        "nombres_completos": "Francisco Perez",
        "cargo": "Estudiante",
        "carrera": "Computacion",
        "nivel": "8vo",
        "discapacidad": "NO",
        "materia_motivo": "Redes Avanzadas",
        "numero_estudiantes": 5,
        "fecha_prestamo": "2026-01-25",
        "horario_uso": "08:00 - 10:00",
        "descripcion_actividades": "Configuracion de topologias y pruebas de conectividad",
        "laboratorio": "Laboratorio Networking 3",
        "equipo": "Router 2800",
        "created_at": "2026-01-18T12:34:56.789123"
    }
}
```

### GET `/api/admin/users` (requiere token de administrador)
- **Objetivo:** listar usuarios registrados para fines de control.
- **Autenticación:** JWT con claim `is_admin=true`.
- **Restricciones:** resultados muestran cédula enmascarada y contraseña como `********`.
- **Respuesta:** HTTP 200 con conteo total y arreglo `usuarios`.

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

Sin cuerpo.

#### Ejemplo de respuesta

```json
{
        "total": 1,
        "usuarios": [
                {
                        "id": 1,
                        "nombre": "Francisco",
                        "apellido": "Perez",
                        "correo": "fran@est.ups.edu.ec",
                        "cedula": "17XXXXXXX5",
                        "carrera": "Ingeniería de Sistemas",
                        "created_at": "2026-01-18T12:34:56.789123",
                        "password": "********"
                }
        ]
}
```

### PATCH `/api/admin/users/{id}` (requiere token de administrador)
- **Objetivo:** permitir a administradores actualizar datos del usuario y rotar contraseñas.
- **Autenticación:** JWT administrativo.
- **Restricciones:**
    - Campos opcionales (`nombre`, `apellido`, `correo`, `cedula`, `carrera`, `contrasena`).
    - Validaciones de correo y contraseña idénticas a las de registro.
- **Respuesta:** HTTP 200 con el usuario actualizado (cédula enmascarada, contraseña oculta).

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

```json
{
        "nombre": "Francisco Javier",
        "contrasena": "NuevoPass12"
}
```

#### Ejemplo de respuesta

```json
{
        "message": "Usuario actualizado",
        "usuario": {
                "id": 1,
                "nombre": "Francisco Javier",
                "apellido": "Perez",
                "correo": "fran@est.ups.edu.ec",
                "cedula": "17XXXXXXX5",
                "carrera": "Ingeniería de Sistemas",
                "created_at": "2026-01-18T12:34:56.789123",
                "password": "********"
        }
}
```

### DELETE `/api/admin/users/{id}` (requiere token de administrador)
- **Objetivo:** eliminar usuarios y cascada sus reservas asociadas.
- **Autenticación:** JWT administrativo.
- **Restricciones:** responde 404 si el usuario no existe.
- **Respuesta:** HTTP 200 con mensaje de confirmación.

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

Sin cuerpo.

#### Ejemplo de respuesta

```json
{
        "message": "Usuario eliminado"
}
```

### GET `/api/admin/laboratories` (requiere token de administrador)
- **Objetivo:** listar solicitudes de laboratorio con filtros ya aplicados (cédulas enmascaradas a través del usuario relacionado).
- **Autenticación:** JWT administrativo.
- **Respuesta:** HTTP 200 con arreglo `reservas` y metadatos.

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

Sin cuerpo.

#### Ejemplo de respuesta

```json
{
        "total": 1,
        "reservas": [
                {
                        "id": 1,
                        "usuario_id": 1,
                        "correo_institucional": "fran@est.ups.edu.ec",
                        "nombres_completos": "Francisco Perez",
                        "cargo": "Estudiante",
                        "carrera": "Computacion",
                        "nivel": "8vo",
                        "discapacidad": "NO",
                        "materia_motivo": "Redes Avanzadas",
                        "numero_estudiantes": 5,
                        "fecha_prestamo": "2026-01-25",
                        "horario_uso": "08:00 - 10:00",
                        "descripcion_actividades": "Configuracion de topologias y pruebas de conectividad",
                        "laboratorio": "Laboratorio Networking 3",
                        "equipo": "Router 2800",
                        "created_at": "2026-01-18T12:34:56.789123"
                }
        ]
}
```

### PATCH `/api/admin/laboratories/{id}` (requiere token de administrador)
- **Objetivo:** editar datos de una reserva (horario, número de estudiantes, etc.).
- **Autenticación:** JWT administrativo.
- **Restricciones:**
    - Validaciones análogas al endpoint de creación (catálogos, formatos de fecha/horario, límite de estudiantes, conflictos de horario).
- **Respuesta:** HTTP 200 con la reserva actualizada.

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

```json
{
        "numero_estudiantes": 10,
        "horario_uso": "10:00 - 12:00"
}
```

#### Ejemplo de respuesta

```json
{
        "message": "Reserva actualizada",
        "reserva": {
                "id": 1,
                "usuario_id": 1,
                "correo_institucional": "fran@est.ups.edu.ec",
                "nombres_completos": "Francisco Perez",
                "cargo": "Estudiante",
                "carrera": "Computacion",
                "nivel": "8vo",
                "discapacidad": "NO",
                "materia_motivo": "Redes Avanzadas",
                "numero_estudiantes": 10,
                "fecha_prestamo": "2026-01-25",
                "horario_uso": "10:00 - 12:00",
                "descripcion_actividades": "Configuracion de topologias y pruebas de conectividad",
                "laboratorio": "Laboratorio Networking 3",
                "equipo": "Router 2800",
                "created_at": "2026-01-18T12:34:56.789123"
        }
}
```

### DELETE `/api/admin/laboratories/{id}` (requiere token de administrador)
- **Objetivo:** eliminar la reserva seleccionada.
- **Autenticación:** JWT administrativo.
- **Respuesta:** HTTP 200 con mensaje de confirmación.

#### Ejemplo de solicitud

```
Authorization: Bearer <admin_token>
```

#### Ejemplo de respuesta

```json
{
        "message": "Reserva eliminada"
}
```

## Reglas de validación y seguridad

- Solo se aceptan correos con dominios `@est.ups.edu.ec` o `@ups.edu.ec`.
- La contraseña debe ser alfanumérica, de 8 a 12 caracteres, con al menos una letra y un número.
- Las contraseñas se guardan con hash Bcrypt y 10 rondas de salt, nunca en texto plano.
- La cédula se almacena completa en base de datos pero se expone enmascarada (ej. `17XXXXXXX5`) en las respuestas JSON.
- El préstamo de laboratorios valida cargos, carreras, niveles, laboratorios y equipos permitidos, además de formatos de fecha (`d/m/yyyy`) y horario (`HH:MM - HH:MM`).
- Cada laboratorio admite como máximo 35 estudiantes por solicitud y se rechazan reservas simultáneas con el mismo laboratorio, fecha y horario.
- Los datos visibles para administradores mantienen la cédula enmascarada y la contraseña como `********`.

### Configuración adicional

- Los catálogos de `cargo`, `carrera`, `nivel`, `laboratorio` y `equipo`, junto al límite de estudiantes (`MAX_ESTUDIANTES`) y patrones de validación, pueden ajustarse en config/options.py.
- La protección contra reservas duplicadas se garantiza con la restricción única declarada en database/models.py (`uq_lab_schedule`), por lo que cualquier cambio en la estructura debe respetar esa integridad.
- La tabla de administradores se define en database/models.py (`Admin`). Puedes crear administradores iniciales ejecutando un script que inserte el registro con contraseña hasheada mediante Bcrypt.
- Las reglas de edición y eliminación de usuarios y reservas se implementan en controllers/admin_controller.py.

