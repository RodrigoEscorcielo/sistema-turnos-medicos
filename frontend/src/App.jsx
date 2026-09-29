import { useState } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SeleccionEspecialidad from './pages/SeleccionEspecialidad';
import MisTurnos from './pages/MisTurnos';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [pantalla, setPantalla] = useState('solicitar');

  if (!usuario) {
    return mostrarRegistro ? (
      <>
        <Registro onRegistroExitoso={setUsuario} />
        <button onClick={() => setMostrarRegistro(false)}>Ya tengo cuenta</button>
      </>
    ) : (
      <>
        <Login onLoginExitoso={setUsuario} />
        <button onClick={() => setMostrarRegistro(true)}>Crear cuenta</button>
      </>
    );
  }

  return (
    <div>
      <nav>
        <button onClick={() => setPantalla('solicitar')}>Solicitar turno</button>
        <button onClick={() => setPantalla('mis-turnos')}>Mis turnos</button>
      </nav>

      {pantalla === 'solicitar' && <SeleccionEspecialidad />}
      {pantalla === 'mis-turnos' && <MisTurnos />}
    </div>
  );
}

export default App;