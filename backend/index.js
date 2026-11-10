require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Listar especialidades
app.get('/especialidades', async (req, res) => {
  try {
    const especialidades = await prisma.especialidades.findMany({ orderBy: { nombre: 'asc' } });
    const formateado = especialidades.map(e => ({ id: Number(e.id), nombre: e.nombre }));
    res.json(formateado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// Listar médicos (filtro opcional por especialidad)
app.get('/medicos', async (req, res) => {
  const { especialidad_id } = req.query;
  try {
    const medicos = await prisma.medicos.findMany({
      where: { especialidad_id: especialidad_id ? BigInt(especialidad_id) : undefined },
      orderBy: { apellido: 'asc' },
    });
    const formateado = medicos.map(m => ({
      id: Number(m.id),
      nombre: m.nombre,
      apellido: m.apellido,
      especialidad_id: Number(m.especialidad_id),
    }));
    res.json(formateado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 1. Consultar disponibilidad de agenda
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

// 2. Crear turno
app.post('/turnos', async (req, res) => {
  // Temporal: cuando exista /auth/login, paciente_id sale del JWT
  const { agenda_id, paciente_id } = req.body;

  try {
    const turno = await prisma.$transaction(async (tx) => {
      const slot = await tx.agenda.findUnique({ where: { id: BigInt(agenda_id) } });

      if (!slot || !slot.disponible) {
        throw new Error('horario_no_disponible');
      }

      await tx.agenda.update({
        where: { id: BigInt(agenda_id) },
        data: { disponible: false },
      });

      return tx.turnos.create({
        data: {
          paciente_id: BigInt(paciente_id),
          medico_id: slot.medico_id,
          agenda_id: BigInt(agenda_id),
          estado: 'confirmado',
        },
      });
    });

    res.status(201).json({ turno_id: Number(turno.id), estado: turno.estado });
  } catch (error) {
    if (error.message === 'horario_no_disponible') {
      return res.status(409).json({ error: 'horario_no_disponible' });
    }
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// Listar mis turnos
// Temporal: cuando exista /auth/login, paciente_id sale del JWT
app.get('/turnos/mios', async (req, res) => {
  const { paciente_id } = req.query;
  try {
    const turnos = await prisma.turnos.findMany({
      where: { paciente_id: BigInt(paciente_id) },
      include: { agenda: true, medicos: { include: { especialidades: true } } },
      orderBy: { agenda: { fecha: 'asc' } },
    });

    const formateado = turnos.map(t => ({
      turno_id: Number(t.id),
      fecha: t.agenda.fecha.toISOString().split('T')[0],
      hora_inicio: t.agenda.hora_inicio.toISOString().split('T')[1].slice(0, 5),
      medico: `${t.medicos.nombre} ${t.medicos.apellido}`,
      especialidad: t.medicos.especialidades.nombre,
      estado: t.estado,
    }));

    res.json(formateado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 3. Cancelar turno
app.patch('/turnos/:id/cancelar', async (req, res) => {
  const { id } = req.params;

  try {
    const turno = await prisma.$transaction(async (tx) => {
      const turnoExistente = await tx.turnos.findUnique({ where: { id: BigInt(id) } });

      if (!turnoExistente) {
        throw new Error('turno_no_encontrado');
      }
      if (turnoExistente.estado === 'cancelado') {
        throw new Error('turno_ya_cancelado');
      }

      await tx.agenda.update({
        where: { id: turnoExistente.agenda_id },
        data: { disponible: true },
      });

      return tx.turnos.update({
        where: { id: BigInt(id) },
        data: { estado: 'cancelado', fecha_actualizacion: new Date() },
      });
    });

    res.json({ turno_id: Number(turno.id), estado: turno.estado });
  } catch (error) {
    if (error.message === 'turno_no_encontrado') {
      return res.status(404).json({ error: 'turno_no_encontrado' });
    }
    if (error.message === 'turno_ya_cancelado') {
      return res.status(409).json({ error: 'turno_ya_cancelado' });
    }
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

app.listen(3000, () => console.log('Backend corriendo en http://localhost:3000'));