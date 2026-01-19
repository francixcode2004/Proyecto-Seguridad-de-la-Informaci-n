import { useState } from "react";
import { registerUser } from "../../api/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    await registerUser(form);
    alert("Usuario registrado correctamente");
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "450px" }}>
        <h4 className="text-center mb-4">Registro de Usuario</h4>

        <form onSubmit={submit}>
          <input className="form-control mb-2" name="nombre" placeholder="Nombre" onChange={handleChange} required />
          <input className="form-control mb-2" name="apellido" placeholder="Apellido" onChange={handleChange} required />
          <input className="form-control mb-2" name="correo" placeholder="Correo institucional" onChange={handleChange} required />
          <input className="form-control mb-2" name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} required />
          <input className="form-control mb-2" name="cedula" placeholder="Cédula" onChange={handleChange} required />
          <input className="form-control mb-3" name="carrera" placeholder="Carrera" onChange={handleChange} required />

          <button className="btn btn-success w-100 mb-2" type="submit">
            Registrarse
          </button>
        </form>

        <button
          className="btn btn-secondary w-100"
          onClick={() => navigate("/login")}
        >
          Regresar al Login
        </button>
      </div>
    </div>
  );
}