import { useState } from "react";
import { loginUser } from "../../api/authService";
import { useNavigate } from "react-router-dom";
import RegisterUser from "./RegisterUser"; // tu componente de registro de usuario

export default function LoginUser() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser({ correo, contrasena });
      localStorage.setItem("access_token", res.data.token);
      navigate("/user"); // página principal de usuario
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  if (showRegister) {
    return <RegisterUser onClose={() => setShowRegister(false)} />;
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h4 className="text-center mb-4">Login Usuario</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Correo institucional"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button className="btn btn-primary w-100 mb-2">Ingresar</button>
        </form>

        <div className="text-center mb-2">
          <span className="text-muted">¿No tienes cuenta? </span>
         <button
         className="btn btn-link p-0"
         onClick={() => navigate("/register")}
         >
          Registrarse
         </button>
        </div>

        <div className="text-center mt-2">
          <button
            className="btn btn-secondary w-100"
            onClick={() => navigate("/")}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
}