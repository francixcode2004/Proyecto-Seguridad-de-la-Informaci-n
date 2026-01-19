import { useEffect, useState } from "react";
import { getLaboratories, deleteLaboratory, updateLaboratory } from "../../api/adminService";
import { useNavigate } from "react-router-dom";

export default function LaboratoriesList() {
  const [labs, setLabs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const fetchLabs = () => {
    getLaboratories()
      .then(res => setLabs(res.data.reservas))
      .catch(() => alert("No autorizado o sesión expirada"));
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar reserva?")) return;
    await deleteLaboratory(id);
    setLabs(labs.filter(l => l.id !== id));
  };

  const startEdit = (lab) => {
    setEditingLab(lab.id);

    // Convertir fecha DD/MM/YYYY → YYYY-MM-DD para el input type=date
    let fechaInput = "";
    if (lab.fecha_prestamo) {
      const parts = lab.fecha_prestamo.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        fechaInput = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else {
        fechaInput = lab.fecha_prestamo;
      }
    }

    setForm({ ...lab, fecha_prestamo: fechaInput });
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingLab(null);
    setForm({});
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const saveEdit = async (id) => {
    try {
      // Convertir fecha YYYY-MM-DD → DD/MM/YYYY
      let fechaFormateada = "";
      if (form.fecha_prestamo) {
        const [year, month, day] = form.fecha_prestamo.split("-");
        fechaFormateada = `${parseInt(day)}/${parseInt(month)}/${year}`;
      }

      const payload = {
        correo_institucional: form.correo_institucional || "",
        nombres_completos: form.nombres_completos || "",
        cargo: form.cargo || "ESTUDIANTE",
        carrera: form.carrera || "COMPUTACION",
        nivel: form.nivel || "7MO",
        discapacidad: form.discapacidad || "NO",
        materia_motivo: form.materia_motivo || "",
        numero_estudiantes: Number(form.numero_estudiantes) || 1,
        fecha_prestamo: fechaFormateada,
        horario_uso: form.horario_uso || "",
        descripcion_actividades: form.descripcion_actividades || "",
        laboratorio: form.laboratorio || "LABORATORIO NETWORKING 1",
        equipo: form.equipo || "NINGUNO"
      };

      await updateLaboratory(id, payload);
      alert("Reserva actualizada correctamente");
      cancelEdit();
      fetchLabs();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Error al actualizar la reserva");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Reservas de Laboratorio</h4>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Laboratorio</th>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Solicitante</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {labs.map(lab => (
            <tr key={lab.id}>
              <td>{lab.laboratorio}</td>
              <td>{lab.fecha_prestamo}</td>
              <td>{lab.horario_uso}</td>
              <td>{lab.nombres_completos}</td>
              <td>
                <button className="btn btn-sm btn-primary me-1" onClick={() => startEdit(lab)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(lab.id)}>
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Reserva</h5>
                <button type="button" className="btn-close" onClick={cancelEdit}></button>
              </div>

              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="correo_institucional"
                      placeholder="Correo institucional"
                      value={form.correo_institucional || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="nombres_completos"
                      placeholder="Nombres completos"
                      value={form.nombres_completos || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="cargo"
                      placeholder="Cargo"
                      value={form.cargo || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="carrera"
                      placeholder="Carrera"
                      value={form.carrera || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="nivel"
                      placeholder="Nivel"
                      value={form.nivel || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="discapacidad"
                      placeholder="Discapacidad"
                      value={form.discapacidad || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="materia_motivo"
                      placeholder="Materia / Motivo"
                      value={form.materia_motivo || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      type="number"
                      name="numero_estudiantes"
                      placeholder="Número de estudiantes"
                      value={form.numero_estudiantes || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_prestamo"
                      value={form.fecha_prestamo || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="horario_uso"
                      placeholder="Horario (HH:MM - HH:MM)"
                      value={form.horario_uso || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-12 mb-2">
                    <textarea
                      className="form-control"
                      name="descripcion_actividades"
                      placeholder="Descripción de actividades"
                      value={form.descripcion_actividades || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="laboratorio"
                      placeholder="Laboratorio"
                      value={form.laboratorio || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="equipo"
                      placeholder="Equipo"
                      value={form.equipo || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer d-flex flex-column">
                <div className="mb-2 w-100 d-flex justify-content-between">
                  <button className="btn btn-secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={() => saveEdit(editingLab)}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
       {/* Botón de regresar abajo */}
                <button
                  className="btn btn-warning w-100"
                  onClick={() => navigate("/admin/users")}
                >
                  Regresar
                </button>
    </div>
  );
}
