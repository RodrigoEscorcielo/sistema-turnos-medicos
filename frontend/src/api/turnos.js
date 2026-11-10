import cliente from './cliente';

// Temporal: se elimina cuando el paciente_id salga del JWT
const PACIENTE_ID_TEMPORAL = 1;

// POST /turnos → { turno_id, estado }
export async function crearTurno(agendaId) {
  const respuesta = await cliente.post('/turnos', { agenda_id: agendaId, paciente_id: PACIENTE_ID_TEMPORAL });
  return respuesta.data;
}

// GET /turnos/mios → [{ turno_id, fecha, hora_inicio, medico, especialidad, estado }]
export async function getMisTurnos() {
  const respuesta = await cliente.get('/turnos/mios', { params: { paciente_id: PACIENTE_ID_TEMPORAL } });
  return respuesta.data;
}

// PATCH /turnos/:id/cancelar → { turno_id, estado }
export async function cancelarTurno(turnoId) {
  const respuesta = await cliente.patch(`/turnos/${turnoId}/cancelar`);
  return respuesta.data;
}
