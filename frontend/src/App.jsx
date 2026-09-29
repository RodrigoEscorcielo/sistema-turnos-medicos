import { useState } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SeleccionEspecialidad from './pages/SeleccionEspecialidad';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

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

  return <SeleccionEspecialidad />;
}

export default App;