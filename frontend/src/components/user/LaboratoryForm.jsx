import { useState } from "react";
import { createLaboratory } from "../../api/laboratoryService";

export default function LaboratoryRegister() {
  const [form, setForm] = useState({
    correo_institucional: "",
    nombres_completos: "",
    cargo: "ESTUDIANTE",
    carrera: "COMPUTACION",
    nivel: "7MO",
    discapacidad: "NO",
    materia_motivo: "",
    numero_estudiantes: "",
    fecha_prestamo: "", // input date → YYYY-MM-DD
    horario_uso: "",
    descripcion_actividades: "",
    laboratorio: "LABORATORIO NETWORKING 1",
    equipo: "NINGUNO",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();

    // 🔒 Validaciones mínimas
    if (!form.fecha_prestamo) {
      alert("Debe seleccionar una fecha de préstamo válida");
      return;
    }

    if (Number(form.numero_estudiantes) <= 0) {
      alert("El número de estudiantes debe ser mayor a 0");
      return;
    }

    // 🔴 CONVERSIÓN DEFINITIVA DE FECHA
    // YYYY-MM-DD  →  d/m/yyyy  (SIN ceros a la izquierda)
    const [year, month, day] = form.fecha_prestamo.split("-");
    const fechaFormateada = `${parseInt(day)}/${parseInt(month)}/${year}`;

    const payload = {
      correo_institucional: form.correo_institucional,
      nombres_completos: form.nombres_completos,
      cargo: form.cargo,
      carrera: form.carrera,
      nivel: form.nivel,
      discapacidad: form.discapacidad,
      materia_motivo: form.materia_motivo,
      numero_estudiantes: Number(form.numero_estudiantes),
      fecha_prestamo: fechaFormateada, // ✅ FORMATO CORRECTO
      horario_uso: form.horario_uso,
      descripcion_actividades: form.descripcion_actividades,
      laboratorio: form.laboratorio,
      equipo: form.equipo,
    };

    try {
      await createLaboratory(payload);
      alert("Solicitud de laboratorio registrada correctamente");

      // 🔄 Reset formulario
      setForm({
        correo_institucional: "",
        nombres_completos: "",
        cargo: "ESTUDIANTE",
        carrera: "COMPUTACION",
        nivel: "7MO",
        discapacidad: "NO",
        materia_motivo: "",
        numero_estudiantes: "",
        fecha_prestamo: "",
        horario_uso: "",
        descripcion_actividades: "",
        laboratorio: "LABORATORIO NETWORKING 1",
        equipo: "NINGUNO",
      });
    } catch (error) {
      console.error("Error backend:", error.response?.data);
      alert(
        error.response?.data?.detalle ||
          error.response?.data?.message ||
          "Error al registrar la solicitud de laboratorio"
      );
    }
  };

  return (
    <div className="container mt-4">
      <h4>Registro de Laboratorio</h4>

      <form onSubmit={submit}>
        {/* Correo */}
        <input
          className="form-control mb-2"
          name="correo_institucional"
          placeholder="Correo institucional"
          value={form.correo_institucional}
          onChange={handleChange}
          required
        />

        {/* Nombre */}
        <input
          className="form-control mb-2"
          name="nombres_completos"
          placeholder="Nombres completos"
          value={form.nombres_completos}
          onChange={handleChange}
          required
        />

        {/* Cargo */}
        <select
          className="form-control mb-2"
          name="cargo"
          value={form.cargo}
          onChange={handleChange}
        >
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="DOCENTE">Docente</option>
          <option value="EGRESADO">Egresado</option>
        </select>

        {/* Carrera */}
        <select
          className="form-control mb-2"
          name="carrera"
          value={form.carrera}
          onChange={handleChange}
        >
          <option value="COMPUTACION">Computación</option>
          <option value="SISTEMAS">Sistemas</option>
          <option value="ELECTRONICA">Electrónica</option>
          <option value="TELECOMUNICACIONES">Telecomunicaciones</option>
        </select>

        {/* Nivel */}
        <select
          className="form-control mb-2"
          name="nivel"
          value={form.nivel}
          onChange={handleChange}
        >
          <option value="1RO">1ro</option>
          <option value="2DO">2do</option>
          <option value="3RO">3ro</option>
          <option value="4TO">4to</option>
          <option value="5TO">5to</option>
          <option value="6TO">6to</option>
          <option value="7MO">7mo</option>
          <option value="8VO">8vo</option>
          <option value="9NO">9no</option>
          <option value="10MO">10mo</option>
        </select>

        {/* Discapacidad */}
        <select
          className="form-control mb-2"
          name="discapacidad"
          value={form.discapacidad}
          onChange={handleChange}
        >
          <option value="NO">No</option>
          <option value="SI">Sí</option>
        </select>

        {/* Materia */}
        <input
          className="form-control mb-2"
          name="materia_motivo"
          placeholder="Materia / Motivo"
          value={form.materia_motivo}
          onChange={handleChange}
          required
        />

        {/* Número estudiantes */}
        <input
          className="form-control mb-2"
          type="number"
          name="numero_estudiantes"
          placeholder="Número de estudiantes"
          value={form.numero_estudiantes}
          onChange={handleChange}
          required
          min="1"
        />

        {/* Fecha */}
        <input
          className="form-control mb-2"
          type="date"
          name="fecha_prestamo"
          value={form.fecha_prestamo}
          onChange={handleChange}
          required
        />

        {/* Horario */}
        <input
          className="form-control mb-2"
          name="horario_uso"
          placeholder="Horario (HH:MM - HH:MM)"
          value={form.horario_uso}
          onChange={handleChange}
          required
        />

        {/* Descripción */}
        <textarea
          className="form-control mb-2"
          name="descripcion_actividades"
          placeholder="Descripción de actividades"
          value={form.descripcion_actividades}
          onChange={handleChange}
          required
        />

        {/* Laboratorio */}
        <select
          className="form-control mb-2"
          name="laboratorio"
          value={form.laboratorio}
          onChange={handleChange}
        >
          <option value="LABORATORIO NETWORKING 1">Networking 1</option>
          <option value="LABORATORIO NETWORKING 2">Networking 2</option>
          <option value="LABORATORIO NETWORKING 3">Networking 3</option>
          <option value="LABORATORIO COMPUTACION AVANZADA">
            Computación Avanzada
          </option>
          <option value="LABORATORIO IHM">IHM</option>
        </select>

        {/* Equipo */}
        <select
          className="form-control mb-3"
          name="equipo"
          value={form.equipo}
          onChange={handleChange}
        >
          <option value="NINGUNO">Ninguno</option>
          <option value="ROUTER 2800">Router 2800</option>
          <option value="SWITCH 2960">Switch 2960</option>
          <option value="KIT ARDUINO">Kit Arduino</option>
          <option value="KIT RASPBERRY">Kit Raspberry</option>
        </select>

        <button className="btn btn-success w-100">
          Registrar solicitud
        </button>
      </form>
    </div>
  );
}