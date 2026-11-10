import cliente from './cliente';

// POST /admin/agenda → { creados, omitidos, horarios }
// datos: { medico_id, fecha, hora_desde, hora_hasta, duracion_minutos }
export async function cargarAgenda(datos) {
  const respuesta = await cliente.post('/admin/agenda', datos);
  return respuesta.data;
}
