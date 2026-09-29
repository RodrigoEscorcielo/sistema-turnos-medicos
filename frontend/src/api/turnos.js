// src/api/turnos.js
// POST /turnos → { agenda_id } → { turno_id, estado }
let turnosMock = [];
let siguienteId = 1;

export async function crearTurno(agendaId) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const turno = {
    turno_id: siguienteId++,
    agenda_id: agendaId,
    estado: 'confirmado',
  };
  turnosMock.push(turno);
  return turno;
}