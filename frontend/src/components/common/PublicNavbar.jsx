import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">Sistema de Laboratorios</span>

        <div className="ms-auto">
          <Link className="btn btn-outline-light me-2" to="/login">
            Usuario
          </Link>
          <Link className="btn btn-outline-warning" to="/login-admin">
            Administrador
          </Link>
        </div>
      </div>
    </nav>
  );
}