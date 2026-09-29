// src/api/especialidades.js

// Datos simulados, siguiendo el formato exacto del contrato de API:
// GET /especialidades → [{ id, nombre }]
const especialidadesMock = [
  { id: 1, nombre: "Clínica Médica" },
  { id: 2, nombre: "Pediatría" },
  { id: 3, nombre: "Cardiología" },
  { id: 4, nombre: "Dermatología" },
];

export async function getEspecialidades() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return especialidadesMock;
}