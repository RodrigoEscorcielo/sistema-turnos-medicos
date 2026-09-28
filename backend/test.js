require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    const especialidades = await prisma.especialidades.findMany();
    console.log('✔ Conexión OK. Especialidades:');
    console.log(especialidades);
  } catch (error) {
    console.error('✘ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();