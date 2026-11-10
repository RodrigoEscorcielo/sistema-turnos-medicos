import cliente from './cliente';

// GET /agenda/disponibilidad?medico_id=X → [{ agenda_id, medico_id, fecha, hora_inicio, hora_fin }]
export async function getDisponibilidad(medicoId) {
  const respuesta = await cliente.get('/agenda/disponibilidad', { params: { medico_id: medicoId } });
  return respuesta.data;
}
