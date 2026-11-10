import { useState } from 'react';
import { enviarMensaje } from '../api/ia';

function Chat() {
  const [mensajes, setMensajes] = useState([
    { rol: 'ia', texto: '¡Hola! Puedo ayudarte a consultar horarios, reservar o cancelar turnos.' },
  ]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);

  async function handleEnviar(evento) {
    evento.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje || pensando) return;

    const historial = mensajes.slice(1); // sin el saludo inicial
    setMensajes([...mensajes, { rol: 'usuario', texto: mensaje }]);
    setTexto('');
    setPensando(true);

    try {
      const data = await enviarMensaje(mensaje, historial);
      setMensajes((anteriores) => [...anteriores, { rol: 'ia', texto: data.respuesta }]);
    } catch (error) {
      setMensajes((anteriores) => [
        ...anteriores,
        { rol: 'ia', texto: 'No pude responder en este momento. Intentá de nuevo en unos segundos.' },
      ]);
    } finally {
      setPensando(false);
    }
  }

  return (
    <div>
      <h2>Asistente de turnos</h2>
      <ul>
        {mensajes.map((m, indice) => (
          <li key={indice}>
            <strong>{m.rol === 'usuario' ? 'Vos' : 'Asistente'}:</strong> {m.texto}
          </li>
        ))}
        {pensando && <li><em>Pensando...</em></li>}
      </ul>
      <form onSubmit={handleEnviar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí tu consulta..."
          disabled={pensando}
        />
        <button type="submit" disabled={pensando || !texto.trim()}>Enviar</button>
      </form>
    </div>
  );
}

export default Chat;
