import cliente from './cliente';

// GET /especialidades → [{ id, nombre }]
export async function getEspecialidades() {
  const respuesta = await cliente.get('/especialidades');
  return respuesta.data;
}
