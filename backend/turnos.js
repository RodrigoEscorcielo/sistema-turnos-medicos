// Lógica de turnos compartida por las rutas y por el chat de IA
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function formatearFecha(fecha) {
  return fecha.toISOString().split('T')[0];
}

function formatearHora(hora) {
  return hora.toISOString().split('T')[1].slice(0, 5);
}

async function consultarDisponibilidad(medicoId) {
  const horarios = await prisma.agenda.findMany({
    where: { medico_id: medicoId ? BigInt(medicoId) : undefined, disponible: true },
    orderBy: [{ fecha: 'asc' }, { hora_inicio: 'asc' }],
  });

  return horarios.map(a => ({
    agenda_id: Number(a.id),
    medico_id: Number(a.medico_id),
    fecha: formatearFecha(a.fecha),
    hora_inicio: formatearHora(a.hora_inicio),
    hora_fin: formatearHora(a.hora_fin),
  }));
}

async function reservarTurno(agendaId, pacienteId) {
  const turno = await prisma.$transaction(async (tx) => {
    const horario = await tx.agenda.findUnique({ where: { id: BigInt(agendaId) } });

    if (!horario || !horario.disponible) {
      throw new Error('horario_no_disponible');
    }

    await tx.agenda.update({
      where: { id: BigInt(agendaId) },
      data: { disponible: false },
    });

    return tx.turnos.create({
      data: {
        paciente_id: BigInt(pacienteId),
        medico_id: horario.medico_id,
        agenda_id: BigInt(agendaId),
        estado: 'confirmado',
      },
    });
  });

  return { turno_id: Number(turno.id), estado: turno.estado };
}

// pacienteId es opcional: si viene, se verifica que el turno sea de ese paciente
async function cancelarTurnoPorId(turnoId, pacienteId) {
  const turno = await prisma.$transaction(async (tx) => {
    const turnoExistente = await tx.turnos.findUnique({ where: { id: BigInt(turnoId) } });

    if (!turnoExistente) {
      throw new Error('turno_no_encontrado');
    }
    if (pacienteId && turnoExistente.paciente_id !== BigInt(pacienteId)) {
      throw new Error('turno_ajeno');
    }
    if (turnoExistente.estado === 'cancelado') {
      throw new Error('turno_ya_cancelado');
    }

    await tx.agenda.update({
      where: { id: turnoExistente.agenda_id },
      data: { disponible: true },
    });

    return tx.turnos.update({
      where: { id: BigInt(turnoId) },
      data: { estado: 'cancelado', fecha_actualizacion: new Date() },
    });
  });

  return { turno_id: Number(turno.id), estado: turno.estado };
}

async function listarTurnosDePaciente(pacienteId) {
  const turnos = await prisma.turnos.findMany({
    where: { paciente_id: BigInt(pacienteId) },
    include: { agenda: true, medicos: { include: { especialidades: true } } },
    orderBy: { agenda: { fecha: 'asc' } },
  });

  return turnos.map(t => ({
    turno_id: Number(t.id),
    fecha: formatearFecha(t.agenda.fecha),
    hora_inicio: formatearHora(t.agenda.hora_inicio),
    medico: `${t.medicos.nombre} ${t.medicos.apellido}`,
    especialidad: t.medicos.especialidades.nombre,
    estado: t.estado,
  }));
}

module.exports = {
  prisma,
  consultarDisponibilidad,
  reservarTurno,
  cancelarTurnoPorId,
  listarTurnosDePaciente,
};
