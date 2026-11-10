import cliente from './cliente';

// Temporal: se elimina cuando el paciente_id salga del JWT
const PACIENTE_ID_TEMPORAL = 1;

// POST /ia/chat → { respuesta }
// historial: [{ rol: 'usuario' | 'ia', texto }]
export async function enviarMensaje(mensaje, historial) {
  const respuesta = await cliente.post('/ia/chat', {
    mensaje,
    historial,
    paciente_id: PACIENTE_ID_TEMPORAL,
  });
  return respuesta.data;
}
