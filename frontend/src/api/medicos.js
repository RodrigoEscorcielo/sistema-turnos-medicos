import cliente from './cliente';

// GET /medicos?especialidad_id=X → [{ id, nombre, apellido, especialidad_id }]
export async function getMedicos(especialidadId) {
  const respuesta = await cliente.get('/medicos', { params: { especialidad_id: especialidadId } });
  return respuesta.data;
}
