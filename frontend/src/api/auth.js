import cliente from './cliente';

// POST /auth/login → { usuario_id, rol, paciente_id, nombre }
export async function login({ email, password }) {
  const respuesta = await cliente.post('/auth/login', { email, password });
  return respuesta.data;
}

// POST /auth/registro → { usuario_id, rol, paciente_id, nombre }
// datos: { nombre, apellido, nro_credencial, email, password, telefono }
export async function registrar(datos) {
  const respuesta = await cliente.post('/auth/registro', datos);
  return respuesta.data;
}
