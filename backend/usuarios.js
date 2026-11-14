// Lógica de usuarios: alta de pacientes y manejo de contraseñas.
// Preparado para reutilizar en POST /auth/registro y POST /auth/login (JWT).
const bcrypt = require('bcryptjs');
const { prisma } = require('./turnos');

const VUELTAS_HASH = 10;
const LARGO_MINIMO_CONTRASENA = 6;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Contraseñas ----
// Todo el manejo de contraseñas pasa por estas dos funciones.

async function hashearContrasena(contrasena) {
  return bcrypt.hash(contrasena, VUELTAS_HASH);
}

// Para el login: compara la contraseña escrita con el hash guardado
async function contrasenaCoincide(contrasena, hashGuardado) {
  return bcrypt.compare(contrasena, hashGuardado);
}

// ---- Alta de pacientes ----

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function textoValido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Crea el usuario (login) y el paciente (datos) en una sola transacción
async function registrarPaciente({ nombre, apellido, nro_credencial, email, password, telefono }) {
  const emailNormalizado = normalizarEmail(email);

  if (
    !textoValido(nombre) ||
    !textoValido(apellido) ||
    !textoValido(nro_credencial) ||
    !FORMATO_EMAIL.test(emailNormalizado) ||
    typeof password !== 'string' ||
    password.length < LARGO_MINIMO_CONTRASENA ||
    (telefono !== undefined && telefono !== null && typeof telefono !== 'string')
  ) {
    throw new Error('datos_invalidos');
  }

  const credencial = nro_credencial.trim();
  const contrasenaHash = await hashearContrasena(password);

  try {
    return await prisma.$transaction(async (tx) => {
      if (await tx.usuarios.findUnique({ where: { email: emailNormalizado } })) {
        throw new Error('email_ya_registrado');
      }
      if (await tx.pacientes.findUnique({ where: { nro_credencial: credencial } })) {
        throw new Error('credencial_ya_registrada');
      }

      const usuario = await tx.usuarios.create({
        data: { email: emailNormalizado, contrasena_hash: contrasenaHash, rol: 'paciente' },
      });

      const paciente = await tx.pacientes.create({
        data: {
          usuario_id: usuario.id,
          nro_credencial: credencial,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono && telefono.trim() ? telefono.trim() : null,
          email: emailNormalizado,
        },
      });

      return { paciente_id: Number(paciente.id), usuario_id: Number(usuario.id) };
    });
  } catch (error) {
    // Dos altas simultáneas con el mismo dato: lo frena la restricción unique de la base
    if (error.code === 'P2002') {
      const campos = String(error.meta?.target || '');
      throw new Error(campos.includes('nro_credencial') ? 'credencial_ya_registrada' : 'email_ya_registrado');
    }
    throw error;
  }
}

// ---- Inicio de sesión (sin token) ----

// Datos que el frontend guarda en su sesión
async function datosDeSesion(usuarioId) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: BigInt(usuarioId) },
    include: { pacientes: true, administrativos: true },
  });
  const persona = usuario.pacientes || usuario.administrativos;

  return {
    usuario_id: Number(usuario.id),
    rol: usuario.rol,
    paciente_id: usuario.pacientes ? Number(usuario.pacientes.id) : null,
    nombre: persona ? `${persona.nombre} ${persona.apellido}` : usuario.email,
  };
}

async function iniciarSesion(email, password) {
  const usuario = await prisma.usuarios.findUnique({ where: { email: normalizarEmail(email) } });

  // Mismo error si el email no existe o la contraseña no coincide
  if (!usuario || typeof password !== 'string' || !(await contrasenaCoincide(password, usuario.contrasena_hash))) {
    throw new Error('credenciales_invalidas');
  }

  return datosDeSesion(usuario.id);
}

module.exports = {
  hashearContrasena,
  contrasenaCoincide,
  normalizarEmail,
  registrarPaciente,
  datosDeSesion,
  iniciarSesion,
};
