require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.get('/agenda/disponibilidad', async (req, res) => {
  const { medico_id } = req.query;
  const disponibilidad = await prisma.agenda.findMany({
    where: { medico_id: medico_id ? BigInt(medico_id) : undefined, disponible: true },
  });

  const formateado = disponibilidad.map(a => ({
    agenda_id: Number(a.id),
    medico_id: Number(a.medico_id),
    fecha: a.fecha.toISOString().split('T')[0],
    hora_inicio: a.hora_inicio.toISOString().split('T')[1].slice(0, 5),
    hora_fin: a.hora_fin.toISOString().split('T')[1].slice(0, 5),
  }));

  res.json(formateado);
});

app.listen(3000, () => console.log('Backend corriendo en http://localhost:3000'));