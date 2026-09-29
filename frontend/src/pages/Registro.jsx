import { useState } from 'react';
import { registrar } from '../api/auth';

function Registro({ onRegistroExitoso }) {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', apellido: '', nro_credencial: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const data = await registrar(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario_id', data.usuario_id);
      onRegistroExitoso(data);
    } catch (err) {
      setError(err.response?.data?.error === 'email_ya_registrado'
        ? 'Ese email ya está registrado.'
        : 'Error al registrarse.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrarse</h2>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
      <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
      <input name="nro_credencial" placeholder="Nro. de credencial" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={cargando}>{cargando ? 'Registrando...' : 'Registrarme'}</button>
    </form>
  );
}

export default Registro;