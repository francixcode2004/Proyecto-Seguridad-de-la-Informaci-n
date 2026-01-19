import { Link } from "react-router-dom";
import { isAdmin, getDecodedToken } from "../../utils/auth";
import { logout as apiLogout } from "../../api/authService";

export default function MainNavbar() {
  const user = getDecodedToken();

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  if (isAdmin()) {
    return (
      <nav className="navbar navbar-dark bg-danger">
        <div className="container">
          <span className="navbar-brand">
            Admin · {user?.nombre}
          </span>

          <div>
            <Link className="btn btn-outline-light me-2" to="/admin/users">
              Usuarios
            </Link>
            <Link className="btn btn-outline-light me-2" to="/admin/laboratories">
              Laboratorios
            </Link>
            <button className="btn btn-light" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-dark bg-primary">
      <div className="container">
        <span className="navbar-brand">
          Usuario · {user?.nombre}
        </span>

        <div>
          <Link className="btn btn-outline-light me-2" to="/user">
            Registrar laboratorio
          </Link>
          <button className="btn btn-light" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
