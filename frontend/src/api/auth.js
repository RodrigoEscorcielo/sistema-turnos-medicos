// POST /auth/registro → { email, password, nombre, apellido, nro_credencial } → { usuario_id, token }
// POST /auth/login → { email, password } → { token, rol, usuario_id }

let usuariosMock = [
  { usuario_id: 1, email: "paciente@mail.com", password: "1234", rol: "paciente" },
];

export async function registrar({ email, password, nombre, apellido, nro_credencial }) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (usuariosMock.find((u) => u.email === email)) {
    throw { response: { status: 409, data: { error: "email_ya_registrado" } } };
  }

  const nuevoUsuario = { usuario_id: usuariosMock.length + 1, email, password, rol: "paciente" };
  usuariosMock.push(nuevoUsuario);

  return { usuario_id: nuevoUsuario.usuario_id, token: `mock-token-${nuevoUsuario.usuario_id}` };
}

export async function login({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const usuario = usuariosMock.find((u) => u.email === email && u.password === password);
  if (!usuario) {
    throw { response: { status: 401, data: { error: "credenciales_invalidas" } } };
  }

  return { token: `mock-token-${usuario.usuario_id}`, rol: usuario.rol, usuario_id: usuario.usuario_id };
}