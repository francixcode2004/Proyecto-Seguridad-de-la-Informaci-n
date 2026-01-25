import { useState } from "react";
import { registerAdmin } from "../../api/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterAdmin() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    await registerAdmin({ ...form, admin: true });

    alert("Administrador registrado exitosamente");
    navigate("/admin/users");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "450px" }}>
        <h4 className="text-center mb-4">Registro Administrador</h4>

        <form onSubmit={submit}>
          <input className="form-control mb-2" name="nombre" placeholder="Nombre" onChange={handleChange} required />
          <input className="form-control mb-2" name="apellido" placeholder="Apellido" onChange={handleChange} required />
          <input className="form-control mb-2" name="correo" placeholder="Correo institucional" onChange={handleChange} required />
          <input className="form-control mb-2" name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} required />
          <input className="form-control mb-2" name="cedula" placeholder="Cédula" onChange={handleChange} required />
          <input className="form-control mb-3" name="carrera" placeholder="Carrera" onChange={handleChange} required />

          <button className="btn btn-danger w-100 mb-2" type="submit">
            Registrar Admin
          </button>
        </form>

        <button
          className="btn btn-secondary w-100"
          onClick={() => navigate("/admin/users")}
        >
          Regresar al panel
        </button>
      </div>
    </div>
  );
}