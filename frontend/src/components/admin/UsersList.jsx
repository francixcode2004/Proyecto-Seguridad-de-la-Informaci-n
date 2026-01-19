import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser } from "../../api/adminService";
import { useNavigate } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const fetchUsers = () => {
    getUsers()
      .then(res => setUsers(res.data.usuarios))
      .catch(() => alert("No autorizado o sesión expirada"));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setForm({ ...user });
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm({});
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const saveEdit = async (id) => {
    try {
      const payload = {
        nombre: form.nombre || "",
        apellido: form.apellido || "",
        correo: form.correo || "",
        contrasena: form.contrasena || "",
        cedula: form.cedula || "",
        carrera: form.carrera || "",
      };

      await updateUser(id, payload);
      alert("Usuario actualizado correctamente");
      cancelEdit();
      fetchUsers();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Error al actualizar el usuario");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Usuarios</h4>

      <table className="table table-striped">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.apellido}</td>
              <td>{u.cedula}</td>
              <td>{u.carrera}</td>
              <td>
                <button className="btn btn-sm btn-primary me-1" onClick={() => startEdit(u)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(u.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuario</h5>
                <button type="button" className="btn-close" onClick={cancelEdit}></button>
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  name="nombre"
                  placeholder="Nombre"
                  value={form.nombre || ""}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="apellido"
                  placeholder="Apellido"
                  value={form.apellido || ""}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="correo"
                  placeholder="Correo institucional"
                  value={form.correo || ""}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="contrasena"
                  type="password"
                  placeholder="Contraseña"
                  value={form.contrasena || ""}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="cedula"
                  placeholder="Cédula"
                  value={form.cedula || ""}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="carrera"
                  placeholder="Carrera"
                  value={form.carrera || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-footer d-flex flex-column">
                <div className="mb-2 w-100 d-flex justify-content-between">
                  <button className="btn btn-secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={() => saveEdit(editingUser)}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
