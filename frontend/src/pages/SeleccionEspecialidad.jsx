// src/pages/SeleccionEspecialidad.jsx
import { useState, useEffect } from 'react';
import { getEspecialidades } from '../api/especialidades';
import { getMedicos } from '../api/medicos';
import { getDisponibilidad } from '../api/agenda';
import { crearTurno } from '../api/turnos';

function SeleccionEspecialidad() {
  const [especialidades, setEspecialidades] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [turnoConfirmado, setTurnoConfirmado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    getEspecialidades().then((data) => {
      setEspecialidades(data);
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (seleccionada) {
      setMedicoSeleccionado(null);
      setHorarios([]);
      setTurnoConfirmado(null);
      getMedicos(seleccionada.id).then(setMedicos);
    }
  }, [seleccionada]);

  useEffect(() => {
    if (medicoSeleccionado) {
      setTurnoConfirmado(null);
      getDisponibilidad(medicoSeleccionado.id).then(setHorarios);
    }
  }, [medicoSeleccionado]);

  async function handleConfirmar(agendaId) {
    setConfirmando(true);
    try {
      const turno = await crearTurno(agendaId);
      setTurnoConfirmado(turno);
    } catch (error) {
      alert('No se pudo confirmar el turno. Intentá de nuevo.');
    } finally {
      setConfirmando(false);
    }
  }

  if (cargando) return <p>Cargando especialidades...</p>;

  return (
    <div>
      <h2>Elegí una especialidad</h2>
      <ul>
        {especialidades.map((esp) => (
          <li key={esp.id}>
            <button onClick={() => setSeleccionada(esp)}>{esp.nombre}</button>
          </li>
        ))}
      </ul>

      {seleccionada && (
        <>
          <h3>Médicos de {seleccionada.nombre}</h3>
          <ul>
            {medicos.map((m) => (
              <li key={m.id}>
                <button onClick={() => setMedicoSeleccionado(m)}>
                  {m.nombre} {m.apellido}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {medicoSeleccionado && !turnoConfirmado && (
        <>
          <h4>Horarios de {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}</h4>
          {horarios.length === 0 ? (
            <p>Sin horarios disponibles.</p>
          ) : (
            <ul>
              {horarios.map((h) => (
                <li key={h.agenda_id}>
                  {h.fecha} — {h.hora_inicio} a {h.hora_fin}{' '}
                  <button disabled={confirmando} onClick={() => handleConfirmar(h.agenda_id)}>
                    {confirmando ? 'Confirmando...' : 'Confirmar turno'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {turnoConfirmado && (
        <p style={{ color: 'green' }}>
          Turno #{turnoConfirmado.turno_id} confirmado correctamente.
        </p>
      )}
    </div>
  );
}

export default SeleccionEspecialidad;