// src/api/turnos.js

let turnosMock = [];
let siguienteId = 1;

// Datos de referencia para armar la respuesta de "mis turnos" con nombre de médico/especialidad
const detalleMock = {
  1: { fecha: "2026-10-02", hora_inicio: "09:00", medico: "Juan Pérez", especialidad: "Pediatría" },
  2: { fecha: "2026-10-02", hora_inicio: "09:30", medico: "Juan Pérez", especialidad: "Pediatría" },
  3: { fecha: "2026-10-03", hora_inicio: "14:00", medico: "Laura Díaz", especialidad: "Pediatría" },
};

// POST /turnos → { agenda_id } → { turno_id, estado }
export async function crearTurno(agendaId) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const yaExiste = turnosMock.find((t) => t.agenda_id === agendaId && t.estado === 'confirmado');
  if (yaExiste) {
    throw { response: { status: 409, data: { error: 'horario_no_disponible' } } };
  }

  const turno = {
    turno_id: siguienteId++,
    agenda_id: agendaId,
    estado: 'confirmado',
  };
  turnosMock.push(turno);
  return turno;
}

// GET /turnos/mios → [{ turno_id, fecha, hora_inicio, medico, especialidad, estado }]
export async function getMisTurnos() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return turnosMock
    .filter((t) => t.estado !== 'cancelado' || true) // se muestran todos, cancelados incluidos
    .map((t) => ({
      turno_id: t.turno_id,
      estado: t.estado,
      ...detalleMock[t.agenda_id],
    }));
}

// PATCH /turnos/:id/cancelar → { turno_id, estado }
export async function cancelarTurno(turnoId) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const turno = turnosMock.find((t) => t.turno_id === turnoId);
  if (!turno) {
    throw { response: { status: 404, data: { error: 'turno_no_encontrado' } } };
  }

  turno.estado = 'cancelado';
  return { turno_id: turno.turno_id, estado: turno.estado };
}