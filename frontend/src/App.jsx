import { useState } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SeleccionEspecialidad from './pages/SeleccionEspecialidad';
import MisTurnos from './pages/MisTurnos';
import Chat from './pages/Chat';
import CargaAgenda from './pages/admin/CargaAgenda';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [pantalla, setPantalla] = useState('solicitar');

  if (!usuario) {
    return mostrarRegistro ? (
      <>
        <Registro onRegistroExitoso={setUsuario} />
        <div style={{ marginTop: '24px' }}>
          <button onClick={() => setMostrarRegistro(false)}>Ya tengo cuenta</button>
        </div>
      </>
    ) : (
      <>
        <Login onLoginExitoso={setUsuario} />
        <div style={{ marginTop: '24px' }}>
          <button onClick={() => setMostrarRegistro(true)}>Crear cuenta</button>
        </div>
      </>
    );
  }

  if (usuario.rol === 'administrativo') {
    return (
      <div>
        <nav>
          <button>Cargar agenda</button>
        </nav>
        <CargaAgenda />
      </div>
    );
  }

  return (
    <div>
      <nav>
        <button onClick={() => setPantalla('solicitar')}>Solicitar turno</button>
        <button onClick={() => setPantalla('mis-turnos')}>Mis turnos</button>
        <button onClick={() => setPantalla('chat')}>Asistente IA</button>
      </nav>

      {pantalla === 'solicitar' && <SeleccionEspecialidad />}
      {pantalla === 'mis-turnos' && <MisTurnos />}
      {pantalla === 'chat' && <Chat />}
    </div>
  );
}

export default App;