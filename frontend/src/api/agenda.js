// GET /agenda/disponibilidad?medico_id=X → [{ agenda_id, fecha, hora_inicio, hora_fin }]
const agendaMock = [
  { agenda_id: 1, medico_id: 2, fecha: "2026-10-02", hora_inicio: "09:00", hora_fin: "09:30" },
  { agenda_id: 2, medico_id: 2, fecha: "2026-10-02", hora_inicio: "09:30", hora_fin: "10:00" },
  { agenda_id: 3, medico_id: 3, fecha: "2026-10-03", hora_inicio: "14:00", hora_fin: "14:30" },
];

export async function getDisponibilidad(medicoId) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return agendaMock.filter((a) => a.medico_id === medicoId);
}