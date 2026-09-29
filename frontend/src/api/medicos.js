// GET /medicos?especialidad_id=X → [{ id, nombre, apellido, especialidad_id }]
const medicosMock = [
  { id: 1, nombre: "Ana", apellido: "Gómez", especialidad_id: 1 },
  { id: 2, nombre: "Juan", apellido: "Pérez", especialidad_id: 2 },
  { id: 3, nombre: "Laura", apellido: "Díaz", especialidad_id: 2 },
];

export async function getMedicos(especialidadId) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return medicosMock.filter((m) => m.especialidad_id === especialidadId);
}