import { useState } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SeleccionEspecialidad from './pages/SeleccionEspecialidad';
import MisTurnos from './pages/MisTurnos';
import Chat from './pages/Chat';
import CargaAgenda from './pages/admin/CargaAgenda';
import GestionTurnos from './pages/admin/GestionTurnos';
import AltaPaciente from './pages/admin/AltaPaciente';
import { leerSesion, guardarSesion, borrarSesion } from './api/sesion';

// Recupera la sesión guardada al recargar la página.
// Descarta sesiones viejas del login simulado (sin paciente_id).
function leerSesionGuardada() {
  const sesion = leerSesion();
  if (!sesion || (sesion.rol === 'paciente' && !sesion.paciente_id)) {
    borrarSesion();
    return null;
  }
  return sesion;
}

function App() {
  const [usuario, setUsuario] = useState(leerSesionGuardada);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [pantalla, setPantalla] = useState('solicitar');
  const [pantallaAdmin, setPantallaAdmin] = useState('agenda');

  // datos: { usuario_id, rol, paciente_id, nombre }
  function iniciarSesion(datos) {
    guardarSesion(datos);
    setUsuario(datos);
  }

  function cerrarSesion() {
    borrarSesion();
    setUsuario(null);
    setMostrarRegistro(false);
    setPantalla('solicitar');
    setPantallaAdmin('agenda');
  }

  if (!usuario) {
    return mostrarRegistro ? (
      <>
        <Registro onRegistroExitoso={iniciarSesion} />
        <div style={{ marginTop: '24px' }}>
          <button onClick={() => setMostrarRegistro(false)}>Ya tengo cuenta</button>
        </div>
      </>
    ) : (
      <>
        <Login onLoginExitoso={iniciarSesion} />
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
          <button onClick={() => setPantallaAdmin('agenda')}>Cargar agenda</button>
          <button onClick={() => setPantallaAdmin('turnos')}>Turnos</button>
          <button onClick={() => setPantallaAdmin('pacientes')}>Pacientes</button>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </nav>

        {pantallaAdmin === 'agenda' && <CargaAgenda />}
        {pantallaAdmin === 'turnos' && <GestionTurnos />}
        {pantallaAdmin === 'pacientes' && <AltaPaciente />}
      </div>
    );
  }

  return (
    <div>
      <nav>
        <button onClick={() => setPantalla('solicitar')}>Solicitar turno</button>
        <button onClick={() => setPantalla('mis-turnos')}>Mis turnos</button>
        <button onClick={() => setPantalla('chat')}>Asistente IA</button>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </nav>

      {pantalla === 'solicitar' && <SeleccionEspecialidad />}
      {pantalla === 'mis-turnos' && <MisTurnos />}
      {pantalla === 'chat' && <Chat />}
    </div>
  );
}

export default App;
