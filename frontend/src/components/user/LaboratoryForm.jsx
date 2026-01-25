import { useEffect, useState } from "react";
import { createLaboratory, fetchLaboratoryReservations } from "../../api/laboratoryService";

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
  const [reservations, setReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [reservationsError, setReservationsError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadReservations = async () => {
      try {
        const res = await fetchLaboratoryReservations();
        if (!mounted) {
          return;
        }
        setReservations(res.data?.reservas || []);
      } catch (error) {
        if (mounted) {
          setReservationsError(error.response?.data?.message || "No fue posible cargar las reservas");
        }
      } finally {
        if (mounted) {
          setIsLoadingReservations(false);
        }
      }
    };

    loadReservations();
    return () => {
      mounted = false;
    };
  }, []);

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

  const getWeekdayLabel = (fecha) => {
    if (!fecha) {
      return "";
    }

    const [dia, mes, anio] = fecha.split("/").map(Number);
    if (!dia || !mes || !anio) {
      return "";
    }

    const jsDate = new Date(anio, mes - 1, dia);
    return jsDate.toLocaleDateString("es-ES", { weekday: "long" });
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Registro de Laboratorio</h4>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Datos de la solicitud</h5>

              <form onSubmit={submit}>
                <div className="mb-3">
                  <label htmlFor="correo_institucional" className="form-label">Correo institucional</label>
                  <input
                    id="correo_institucional"
                    className="form-control"
                    name="correo_institucional"
                    placeholder="usuario@est.ups.edu.ec"
                    value={form.correo_institucional}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="nombres_completos" className="form-label">Nombres completos</label>
                  <input
                    id="nombres_completos"
                    className="form-control"
                    name="nombres_completos"
                    placeholder="Nombres y apellidos"
                    value={form.nombres_completos}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="cargo" className="form-label">Cargo</label>
                  <select
                    id="cargo"
                    className="form-select"
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                  >
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="EGRESADO">Egresado</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="carrera" className="form-label">Carrera</label>
                  <select
                    id="carrera"
                    className="form-select"
                    name="carrera"
                    value={form.carrera}
                    onChange={handleChange}
                  >
                    <option value="COMPUTACION">Computacion</option>
                    <option value="SISTEMAS">Sistemas</option>
                    <option value="ELECTRICIDAD / ELECTRICA">Electricidad / Electrica</option>
                    <option value="ELECTRONICA">Electronica</option>
                    <option value="TELECOMUNICACIONES">Telecomunicaciones</option>
                    <option value="AMBIENTAL">Ambiental</option>
                    <option value="CIVIL">Civil</option>
                    <option value="MECANICA">Mecanica</option>
                    <option value="AUTOMOTRIZ">Automotriz</option>
                    <option value="MAESTRIA">Maestria</option>
                    <option value="CECASIS">CECASIS</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="nivel" className="form-label">Nivel</label>
                  <select
                    id="nivel"
                    className="form-select"
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
                </div>

                <div className="mb-3">
                  <label htmlFor="discapacidad" className="form-label">¿Posee discapacidad?</label>
                  <select
                    id="discapacidad"
                    className="form-select"
                    name="discapacidad"
                    value={form.discapacidad}
                    onChange={handleChange}
                  >
                    <option value="NO">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="materia_motivo" className="form-label">Materia o motivo del préstamo</label>
                  <input
                    id="materia_motivo"
                    className="form-control"
                    name="materia_motivo"
                    placeholder="Nombre de la asignatura o actividad"
                    value={form.materia_motivo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="numero_estudiantes" className="form-label">Número de estudiantes</label>
                  <input
                    id="numero_estudiantes"
                    className="form-control"
                    type="number"
                    name="numero_estudiantes"
                    placeholder="Cantidad de participantes"
                    value={form.numero_estudiantes}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="fecha_prestamo" className="form-label">Fecha de préstamo</label>
                  <input
                    id="fecha_prestamo"
                    className="form-control"
                    type="date"
                    name="fecha_prestamo"
                    value={form.fecha_prestamo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="horario_uso" className="form-label">Horario solicitado</label>
                  <input
                    id="horario_uso"
                    className="form-control"
                    name="horario_uso"
                    placeholder="Ej: 08:00 - 10:00"
                    value={form.horario_uso}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="descripcion_actividades" className="form-label">Descripción de actividades</label>
                  <textarea
                    id="descripcion_actividades"
                    className="form-control"
                    name="descripcion_actividades"
                    placeholder="Explique brevemente qué se realizará"
                    value={form.descripcion_actividades}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="laboratorio" className="form-label">Laboratorio requerido</label>
                  <select
                    id="laboratorio"
                    className="form-select"
                    name="laboratorio"
                    value={form.laboratorio}
                    onChange={handleChange}
                  >
                    <option value="LABORATORIO NETWORKING 1">Networking 1</option>
                    <option value="LABORATORIO NETWORKING 2">Networking 2</option>
                    <option value="LABORATORIO NETWORKING 3">Networking 3</option>
                    <option value="LABORATORIO COMPUTACION AVANZADA">Computación Avanzada</option>
                    <option value="LABORATORIO IHM">IHM</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="equipo" className="form-label">Equipo adicional</label>
                  <select
                    id="equipo"
                    className="form-select"
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
                </div>

                <button className="btn btn-success w-100">
                  Registrar solicitud
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Reservas confirmadas</h5>
                {isLoadingReservations ? <span className="badge bg-secondary">Cargando...</span> : null}
              </div>

              {reservationsError ? (
                <div className="alert alert-warning" role="alert">
                  {reservationsError}
                </div>
              ) : null}

              {!isLoadingReservations && !reservationsError && reservations.length === 0 ? (
                <div className="text-muted">Aún no hay reservas registradas.</div>
              ) : null}

              {!isLoadingReservations && !reservationsError && reservations.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Día</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Laboratorio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation, index) => (
                        <tr key={`${reservation.fecha_prestamo}-${reservation.horario_uso}-${index}`}>
                          <td className="text-capitalize">{getWeekdayLabel(reservation.fecha_prestamo)}</td>
                          <td>{reservation.fecha_prestamo}</td>
                          <td>{reservation.horario_uso}</td>
                          <td>{reservation.laboratorio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}