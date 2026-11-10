import { useState, useEffect } from 'react';
import { getMedicos } from '../../api/medicos';
import { cargarAgenda } from '../../api/admin';

const MENSAJES_ERROR = {
  datos_invalidos: 'Revisá los datos: la hora desde tiene que ser anterior a la hora hasta.',
  fecha_pasada: 'La fecha ya pasó. Elegí una fecha de hoy en adelante.',
  medico_no_encontrado: 'El médico seleccionado no existe.',
};

function CargaAgenda() {
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState({
    medico_id: '',
    fecha: '',
    hora_desde: '09:00',
    hora_hasta: '12:00',
    duracion_minutos: '30',
  });
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMedicos()
      .then(setMedicos)
      .catch(() => setError('No se pudieron cargar los médicos.'));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setResultado(null);
    setError(null);
    try {
      const data = await cargarAgenda({
        ...form,
        medico_id: Number(form.medico_id),
        duracion_minutos: Number(form.duracion_minutos),
      });
      setResultado(data);
    } catch (err) {
      setError(MENSAJES_ERROR[err.response?.data?.error] || 'No se pudieron cargar los horarios.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <h2>Cargar disponibilidad</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <select name="medico_id" value={form.medico_id} onChange={handleChange} required>
            <option value="">Elegí un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Desde <input type="time" name="hora_desde" value={form.hora_desde} onChange={handleChange} required /></label>
          <label> Hasta <input type="time" name="hora_hasta" value={form.hora_hasta} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Duración de cada turno{' '}
            <select name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange}>
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="60">60 min</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={cargando}>{cargando ? 'Cargando...' : 'Cargar horarios'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {resultado && (
        <div>
          <p style={{ color: 'green' }}>
            Se crearon {resultado.creados} horarios ({resultado.omitidos} ya existían).
          </p>
          <ul>
            {resultado.horarios.map((h) => (
              <li key={h.agenda_id}>
                {h.fecha} — {h.hora_inicio} a {h.hora_fin} {h.disponible ? '' : '(ocupado)'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CargaAgenda;
