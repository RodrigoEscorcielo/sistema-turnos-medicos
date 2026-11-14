import cliente from './cliente';
import { obtenerPacienteId } from './sesion';

// El paciente_id sale de la sesión del usuario que inició sesión

// POST /turnos → { turno_id, estado }
export async function crearTurno(agendaId) {
  const respuesta = await cliente.post('/turnos', { agenda_id: agendaId, paciente_id: obtenerPacienteId() });
  return respuesta.data;
}

// GET /turnos/mios → [{ turno_id, fecha, hora_inicio, medico, especialidad, estado }]
export async function getMisTurnos() {
  const respuesta = await cliente.get('/turnos/mios', { params: { paciente_id: obtenerPacienteId() } });
  return respuesta.data;
}

// PATCH /turnos/:id/cancelar → { turno_id, estado }
export async function cancelarTurno(turnoId) {
  const respuesta = await cliente.patch(`/turnos/${turnoId}/cancelar`, { paciente_id: obtenerPacienteId() });
  return respuesta.data;
}
