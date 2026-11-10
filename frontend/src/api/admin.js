import cliente from './cliente';

// POST /admin/agenda → { creados, omitidos, horarios }
// datos: { medico_id, fecha, hora_desde, hora_hasta, duracion_minutos }
export async function cargarAgenda(datos) {
  const respuesta = await cliente.post('/admin/agenda', datos);
  return respuesta.data;
}

// GET /admin/turnos?fecha=&medico_id= → [{ turno_id, fecha, hora_inicio, medico, especialidad, paciente, nro_credencial, estado, motivo }]
export async function getTurnosAdmin(filtros) {
  const respuesta = await cliente.get('/admin/turnos', { params: filtros });
  return respuesta.data;
}

// POST /admin/turnos → { turno_id, estado }
export async function crearTurnoAdmin(agendaId, pacienteId) {
  const respuesta = await cliente.post('/admin/turnos', { agenda_id: agendaId, paciente_id: pacienteId });
  return respuesta.data;
}

// PATCH /admin/turnos/:id/cancelar → { turno_id, estado }
export async function cancelarTurnoAdmin(turnoId, motivo) {
  const respuesta = await cliente.patch(`/admin/turnos/${turnoId}/cancelar`, { motivo });
  return respuesta.data;
}

// GET /admin/pacientes → [{ id, nombre, apellido, nro_credencial }]
export async function getPacientes() {
  const respuesta = await cliente.get('/admin/pacientes');
  return respuesta.data;
}
