// Carga backend/.env aunque el backend se levante desde otra carpeta
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const {
  prisma,
  consultarDisponibilidad,
  reservarTurno,
  cancelarTurnoPorId,
  listarTurnosDePaciente,
  cargarHorarios,
  listarTurnos,
  listarPacientes,
} = require('./turnos');
const { conversarConIA } = require('./ia');

const app = express();
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
  try {
    res.json(await consultarDisponibilidad(medico_id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 2. Crear turno
app.post('/turnos', async (req, res) => {
  // Temporal: cuando exista /auth/login, paciente_id sale del JWT
  const { agenda_id, paciente_id } = req.body;
  try {
    res.status(201).json(await reservarTurno(agenda_id, paciente_id));
  } catch (error) {
    if (error.message === 'horario_no_disponible') {
      return res.status(409).json({ error: 'horario_no_disponible' });
    }
    if (error.message === 'paciente_no_encontrado') {
      return res.status(404).json({ error: 'paciente_no_encontrado' });
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
    res.json(await listarTurnosDePaciente(paciente_id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 3. Cancelar turno
app.patch('/turnos/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  try {
    res.json(await cancelarTurnoPorId(id));
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

// 4. Chat con IA
// Temporal: paciente_id en el body hasta tener JWT
app.post('/ia/chat', async (req, res) => {
  const { mensaje, historial = [], paciente_id } = req.body;
  try {
    const respuesta = await conversarConIA(mensaje, historial, paciente_id);
    res.json({ respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 5. Admin: cargar disponibilidad de un médico
// Temporal: sin control de rol hasta tener JWT
app.post('/admin/agenda', async (req, res) => {
  const { medico_id, fecha, hora_desde, hora_hasta, duracion_minutos } = req.body;
  try {
    const resultado = await cargarHorarios(medico_id, fecha, hora_desde, hora_hasta, duracion_minutos);
    res.status(201).json(resultado);
  } catch (error) {
    if (error.message === 'datos_invalidos' || error.message === 'fecha_pasada') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'medico_no_encontrado') {
      return res.status(404).json({ error: 'medico_no_encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 6. Admin: listar turnos (filtros opcionales: fecha, medico_id)
app.get('/admin/turnos', async (req, res) => {
  const { fecha, medico_id } = req.query;
  try {
    res.json(await listarTurnos(fecha, medico_id));
  } catch (error) {
    if (error.message === 'datos_invalidos') {
      return res.status(400).json({ error: 'datos_invalidos' });
    }
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 7. Admin: reservar turno en nombre de un paciente
app.post('/admin/turnos', async (req, res) => {
  const { agenda_id, paciente_id } = req.body;
  try {
    res.status(201).json(await reservarTurno(agenda_id, paciente_id));
  } catch (error) {
    if (error.message === 'horario_no_disponible') {
      return res.status(409).json({ error: 'horario_no_disponible' });
    }
    if (error.message === 'paciente_no_encontrado') {
      return res.status(404).json({ error: 'paciente_no_encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

// 8. Admin: cancelar cualquier turno, con motivo opcional
app.patch('/admin/turnos/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body || {};
  try {
    res.json(await cancelarTurnoPorId(id, null, motivo));
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

// 9. Admin: listar pacientes
app.get('/admin/pacientes', async (req, res) => {
  try {
    res.json(await listarPacientes());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error_interno' });
  }
});

app.listen(3000, () => console.log('Backend corriendo en http://localhost:3000'));
