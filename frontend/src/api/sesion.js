// Sesión del usuario guardada en el navegador (sin token).
// Contenido: { usuario_id, rol, paciente_id, nombre }
const CLAVE = 'sesion';

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function guardarSesion(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Si el navegador bloquea localStorage, la sesión dura hasta recargar
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Sin localStorage no hay nada que borrar
  }
}

export function obtenerPacienteId() {
  return leerSesion()?.paciente_id ?? null;
}
