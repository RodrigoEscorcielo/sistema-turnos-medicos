import cliente from './cliente';
import { obtenerPacienteId } from './sesion';

// POST /ia/chat → { respuesta }
// historial: [{ rol: 'usuario' | 'ia', texto }]
export async function enviarMensaje(mensaje, historial) {
  const respuesta = await cliente.post('/ia/chat', {
    mensaje,
    historial,
    paciente_id: obtenerPacienteId(),
  });
  return respuesta.data;
}
