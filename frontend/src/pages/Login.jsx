import { useState } from 'react';
import { login } from '../api/auth';

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario_id', data.usuario_id);
      onLoginExitoso(data);
    } catch (err) {
      setError(err.response?.data?.error === 'credenciales_invalidas'
        ? 'Email o contraseña incorrectos.'
        : 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2><br></br>
      <p>paciente@mail.com</p><br></br>
      {/* <!-- comentario test --> */}
      <p>1234</p><br></br>
      <div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={cargando}>{cargando ? 'Ingresando...' : 'Ingresar'}</button>
    </form>
  );
}

export default Login;