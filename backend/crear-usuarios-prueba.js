// Crea o actualiza los usuarios de prueba con contraseña hasheada.
// Uso (una sola vez, o cada vez que se quiera restablecerlos):
//   node backend/crear-usuarios-prueba.js
//
// Usuarios de prueba (solo para desarrollo, no usar contraseñas reales):
//   Paciente:       paciente@mail.com / 1234
//   Administrativo: admin@mail.com    / 1234
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { prisma } = require('./turnos');
const { hashearContrasena } = require('./usuarios');

const CONTRASENA_PRUEBA = '1234';

async function crearOActualizarUsuario(email, rol) {
  const contrasenaHash = await hashearContrasena(CONTRASENA_PRUEBA);
  return prisma.usuarios.upsert({
    where: { email },
    update: { contrasena_hash: contrasenaHash, rol },
    create: { email, contrasena_hash: contrasenaHash, rol },
  });
}

async function main() {
  // Paciente de prueba (ya existe en la base como paciente 1)
  const paciente = await crearOActualizarUsuario('paciente@mail.com', 'paciente');
  const tieneFichaPaciente = await prisma.pacientes.findUnique({ where: { usuario_id: paciente.id } });
  console.log(`Paciente ${paciente.email}: contraseña actualizada${tieneFichaPaciente ? '' : ' (ATENCIÓN: no tiene ficha en pacientes)'}`);

  // Administrativo de prueba
  const admin = await crearOActualizarUsuario('admin@mail.com', 'administrativo');
  const fichaAdmin = await prisma.administrativos.findUnique({ where: { usuario_id: admin.id } });
  if (!fichaAdmin) {
    await prisma.administrativos.create({
      data: { usuario_id: admin.id, nombre: 'Admin', apellido: 'Prueba' },
    });
  }
  console.log(`Administrativo ${admin.email}: ${fichaAdmin ? 'contraseña actualizada' : 'creado'}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
