import { useState } from 'react';
import { crearPaciente } from '../../api/admin';

const FORMULARIO_VACIO = {
  nombre: '',
  apellido: '',
  nro_credencial: '',
  email: '',
  telefono: '',
  password: '',
};

const MENSAJES_ERROR = {
  datos_invalidos: 'Revisá los datos: todos los campos son obligatorios salvo el teléfono, y la contraseña debe tener al menos 6 caracteres.',
  email_ya_registrado: 'Ese email ya está registrado.',
  credencial_ya_registrada: 'Ese número de credencial ya está registrado.',
};

function AltaPaciente() {
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await crearPaciente(form);
      setMensaje({ error: false, texto: `Paciente ${form.nombre} ${form.apellido} creado correctamente.` });
      setForm(FORMULARIO_VACIO);
    } catch (err) {
      setMensaje({
        error: true,
        texto: MENSAJES_ERROR[err.response?.data?.error] || 'No se pudo crear el paciente.',
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h2>Alta de paciente</h2>
      <form onSubmit={handleSubmit}>
        <div><input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required /></div>
        <div><input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required /></div>
        <div><input name="nro_credencial" placeholder="Nro. de credencial" value={form.nro_credencial} onChange={handleChange} required /></div>
        <div><input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /></div>
        <div><input name="telefono" placeholder="Teléfono (opcional)" value={form.telefono} onChange={handleChange} /></div>
        <div>
          <input
            name="password"
            type="password"
            placeholder="Contraseña inicial (mín. 6)"
            minLength={6}
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Crear paciente'}</button>
      </form>
      {mensaje && <p style={{ color: mensaje.error ? 'red' : 'green' }}>{mensaje.texto}</p>}
    </div>
  );
}

export default AltaPaciente;
