// Chat con IA (Google Gemini) usando function calling.
// La IA nunca toca la base: solo pide herramientas y el backend las valida y ejecuta.
const { GoogleGenAI } = require('@google/genai');
const {
  prisma,
  consultarDisponibilidad,
  reservarTurno,
  cancelarTurnoPorId,
  listarTurnosDePaciente,
} = require('./turnos');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 30000 },
});

// Si un modelo está saturado (503) o sin cuota (429), se prueba el siguiente
const MODELOS = [
  process.env.GEMINI_MODELO || 'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];
const MAXIMO_VUELTAS = 5;
const ERRORES_CONOCIDOS = [
  'horario_no_disponible',
  'turno_no_encontrado',
  'turno_ya_cancelado',
  'turno_ajeno',
  'paciente_no_encontrado',
];

const herramientas = [{
  functionDeclarations: [
    {
      name: 'consultarDisponibilidad',
      description: 'Devuelve los horarios libres de un médico. Cada horario tiene agenda_id, fecha (YYYY-MM-DD), hora_inicio y hora_fin.',
      parameters: {
        type: 'object',
        properties: { medico_id: { type: 'integer', description: 'id del médico' } },
        required: ['medico_id'],
      },
    },
    {
      name: 'crearTurno',
      description: 'Reserva un turno para el paciente en el horario indicado.',
      parameters: {
        type: 'object',
        properties: { agenda_id: { type: 'integer', description: 'agenda_id del horario elegido' } },
        required: ['agenda_id'],
      },
    },
    {
      name: 'cancelarTurno',
      description: 'Cancela un turno confirmado del paciente.',
      parameters: {
        type: 'object',
        properties: { turno_id: { type: 'integer', description: 'turno_id del turno a cancelar' } },
        required: ['turno_id'],
      },
    },
  ],
}];

// Le pasa a la IA los médicos y los turnos del paciente, para que no invente ids
async function armarInstrucciones(pacienteId) {
  const medicos = await prisma.medicos.findMany({ include: { especialidades: true } });
  const listaMedicos = medicos
    .map(m => `- medico_id ${Number(m.id)}: ${m.nombre} ${m.apellido} (${m.especialidades.nombre})`)
    .join('\n');

  const turnos = await listarTurnosDePaciente(pacienteId);
  const listaTurnos = turnos.length === 0
    ? 'El paciente no tiene turnos.'
    : turnos
      .map(t => `- turno_id ${t.turno_id}: ${t.fecha} ${t.hora_inicio}, ${t.medico} (${t.especialidad}), ${t.estado}`)
      .join('\n');

  const hoy = new Date().toISOString().split('T')[0];

  return `Sos el asistente de turnos de una clínica médica privada. Hoy es ${hoy}.
Respondé siempre en español, de forma breve y amable.
Solo podés ayudar a consultar horarios, reservar turnos y cancelar turnos, usando las herramientas.
Nunca inventes horarios, médicos ni ids: usá consultarDisponibilidad antes de ofrecer horarios.
Antes de reservar o cancelar, confirmá con el paciente qué turno quiere. Cuando confirme, usá la herramienta.
Si una herramienta devuelve un error, explicáselo al paciente con palabras simples.
No muestres ids internos al paciente salvo que los pida.

Médicos de la clínica:
${listaMedicos}

Turnos del paciente:
${listaTurnos}`;
}

async function ejecutarHerramienta(nombre, argumentos, pacienteId) {
  try {
    if (nombre === 'consultarDisponibilidad') {
      return { horarios: await consultarDisponibilidad(argumentos.medico_id) };
    }
    if (nombre === 'crearTurno') {
      return await reservarTurno(argumentos.agenda_id, pacienteId);
    }
    if (nombre === 'cancelarTurno') {
      return await cancelarTurnoPorId(argumentos.turno_id, pacienteId);
    }
    return { error: 'herramienta_desconocida' };
  } catch (error) {
    if (ERRORES_CONOCIDOS.includes(error.message)) {
      return { error: error.message };
    }
    console.error(error);
    return { error: 'error_interno' };
  }
}

async function pedirAGemini(contenidos, instrucciones) {
  let ultimoError;
  for (const modelo of MODELOS) {
    try {
      return await ai.models.generateContent({
        model: modelo,
        contents: contenidos,
        config: { systemInstruction: instrucciones, tools: herramientas },
      });
    } catch (error) {
      if (error.status !== 503 && error.status !== 429) throw error;
      console.warn(`Gemini ${modelo} no disponible (${error.status}), probando el siguiente modelo`);
      ultimoError = error;
    }
  }
  throw ultimoError;
}

// historial: [{ rol: 'usuario' | 'ia', texto }]
async function conversarConIA(mensaje, historial, pacienteId) {
  const instrucciones = await armarInstrucciones(pacienteId);

  const contenidos = historial.map(h => ({
    role: h.rol === 'usuario' ? 'user' : 'model',
    parts: [{ text: h.texto }],
  }));
  contenidos.push({ role: 'user', parts: [{ text: mensaje }] });

  for (let vuelta = 0; vuelta < MAXIMO_VUELTAS; vuelta++) {
    const respuesta = await pedirAGemini(contenidos, instrucciones);

    const llamadas = respuesta.functionCalls || [];
    if (llamadas.length === 0) {
      return respuesta.text;
    }

    contenidos.push(respuesta.candidates[0].content);

    const resultados = [];
    for (const llamada of llamadas) {
      const resultado = await ejecutarHerramienta(llamada.name, llamada.args || {}, pacienteId);
      resultados.push({ functionResponse: { id: llamada.id, name: llamada.name, response: resultado } });
    }
    contenidos.push({ role: 'user', parts: resultados });
  }

  return 'No pude completar el pedido. Probá de nuevo.';
}

module.exports = { conversarConIA };
