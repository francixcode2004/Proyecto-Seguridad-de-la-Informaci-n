import uuid

from database.models import LaboratoryRequest, User


def _unique_suffix():
    return uuid.uuid4().hex[:6]


def _user_payload():
    suffix = _unique_suffix()
    cedula_digits = str(int(uuid.uuid4().int % 10_000_000_00)).zfill(10)
    return {
        "nombre": "Test",
        "apellido": "User",
        "correo": f"tester{suffix}@est.ups.edu.ec",
        "contrasena": "Passw0rd1",
        "cedula": cedula_digits,
        "carrera": "Ingenieria de Sistemas",
    }


def _admin_payload():
    suffix = _unique_suffix()
    cedula_digits = str(int(uuid.uuid4().int % 10_000_000_00)).zfill(10)
    return {
        "nombre": "Admin",
        "apellido": "User",
        "correo": f"admin{suffix}@est.ups.edu.ec",
        "contrasena": "Passw0rd1",
        "cedula": cedula_digits,
        "carrera": "Ingenieria de Sistemas",
        "admin": True,
    }


def _reservation_payload(correo):
    suffix = _unique_suffix()
    hour_base = int(suffix[:2], 16) % 8
    start_hour = 8 + hour_base
    end_hour = start_hour + 1
    return {
        "correo_institucional": correo,
        "nombres_completos": "Tester Usuario",
        "cargo": "ESTUDIANTE",
        "carrera": "COMPUTACION",
        "nivel": "7MO",
        "discapacidad": "NO",
        "materia_motivo": "Pruebas automatizadas",
        "numero_estudiantes": 3,
        "fecha_prestamo": f"{15 + hour_base}/2/2026",
        "horario_uso": f"{start_hour:02d}:00 - {end_hour:02d}:00",
        "descripcion_actividades": "Verificación de reserva",
        "laboratorio": "LABORATORIO NETWORKING 1",
        "equipo": "NINGUNO",
    }


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def test_user_registration_login_and_logout_flow(client):
    register_res = client.post("/api/auth/register", json=_user_payload())
    assert register_res.status_code == 201

    login_payload = {
        "correo": register_res.json["usuario"]["correo"],
        "contrasena": "Passw0rd1",
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token = login_res.json["token"]

    logout_res = client.post("/api/auth/logout", headers=_auth_header(token))
    assert logout_res.status_code == 200
    assert logout_res.json["message"] == "Sesión cerrada"


def test_user_laboratory_reservation_flow(client, app):
    user_data = _user_payload()
    client.post("/api/auth/register", json=user_data)
    login_res = client.post("/api/auth/login", json={
        "correo": user_data["correo"],
        "contrasena": user_data["contrasena"],
    })
    token = login_res.json["token"]

    reservation_payload = _reservation_payload(user_data["correo"])
    create_res = client.post(
        "/api/auth/laboratory",
        json=reservation_payload,
        headers=_auth_header(token),
    )
    assert create_res.status_code == 201

    list_res = client.get(
        "/api/auth/laboratory/reservations",
        headers=_auth_header(token),
    )
    assert list_res.status_code == 200
    entries = list_res.json["reservas"]
    assert any(entry["horario_uso"] == reservation_payload["horario_uso"] for entry in entries)

    with app.app_context():
        assert LaboratoryRequest.query.count() >= 1


def test_admin_management_flow(client, app):
    user_data = _user_payload()
    register_user_res = client.post("/api/auth/register", json=user_data)
    assert register_user_res.status_code == 201
    user_id = register_user_res.json["usuario"]["id"]

    admin_data = _admin_payload()
    register_admin_res = client.post("/api/auth/register-admin", json=admin_data)
    assert register_admin_res.status_code == 201

    admin_login_res = client.post("/api/auth/login-admin", json={
        "correo": admin_data["correo"],
        "contrasena": admin_data["contrasena"],
    })
    assert admin_login_res.status_code == 200
    admin_token = admin_login_res.json["token"]

    user_login_res = client.post("/api/auth/login", json={
        "correo": user_data["correo"],
        "contrasena": user_data["contrasena"],
    })
    user_token = user_login_res.json["token"]

    reservation_payload = _reservation_payload(user_data["correo"])
    reservation_res = client.post(
        "/api/auth/laboratory",
        json=reservation_payload,
        headers=_auth_header(user_token),
    )
    assert reservation_res.status_code == 201

    users_list_res = client.get(
        "/api/admin/users",
        headers=_auth_header(admin_token),
    )
    assert users_list_res.status_code == 200
    assert users_list_res.json["total"] >= 1

    update_user_res = client.patch(
        f"/api/admin/users/{user_id}",
        json={"carrera": "Sistemas"},
        headers=_auth_header(admin_token),
    )
    assert update_user_res.status_code == 200
    assert update_user_res.json["usuario"]["carrera"] == "Sistemas"

    labs_list_res = client.get(
        "/api/admin/laboratories",
        headers=_auth_header(admin_token),
    )
    assert labs_list_res.status_code == 200
    reserva = labs_list_res.json["reservas"][0]
    reserve_id = reserva["id"]

    update_lab_res = client.patch(
        f"/api/admin/laboratories/{reserve_id}",
        json={"numero_estudiantes": 5},
        headers=_auth_header(admin_token),
    )
    assert update_lab_res.status_code == 200
    assert update_lab_res.json["reserva"]["numero_estudiantes"] == 5

    delete_lab_res = client.delete(
        f"/api/admin/laboratories/{reserve_id}",
        headers=_auth_header(admin_token),
    )
    assert delete_lab_res.status_code == 200

    delete_user_res = client.delete(
        f"/api/admin/users/{user_id}",
        headers=_auth_header(admin_token),
    )
    assert delete_user_res.status_code == 200

    with app.app_context():
        assert User.query.get(user_id) is None
