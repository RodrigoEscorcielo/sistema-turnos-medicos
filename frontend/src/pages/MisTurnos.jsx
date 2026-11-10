import { useState, useEffect } from 'react';
import { getMisTurnos, cancelarTurno } from '../api/turnos';

function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarTurnos();
  }, []);

  function cargarTurnos() {
    setCargando(true);
    setError(false);
    getMisTurnos()
      .then((data) => setTurnos(data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }

  async function handleCancelar(turnoId) {
    setCancelandoId(turnoId);
    try {
      await cancelarTurno(turnoId);
      cargarTurnos();
    } catch (error) {
      alert('No se pudo cancelar el turno.');
    } finally {
      setCancelandoId(null);
    }
  }

  if (cargando) return <p>Cargando tus turnos...</p>;

  if (error) return <p>No se pudieron cargar tus turnos. Intentá de nuevo más tarde.</p>;

  if (turnos.length === 0) return <p>Todavía no tenés turnos.</p>;

  return (
    <div>
      <h2>Mis turnos</h2>
      <ul>
        {turnos.map((t) => (
          <li key={t.turno_id}>
            {t.fecha} — {t.hora_inicio} — {t.medico} ({t.especialidad}) — <strong>{t.estado}</strong>
            {t.estado === 'confirmado' && (
              <button disabled={cancelandoId === t.turno_id} onClick={() => handleCancelar(t.turno_id)}>
                {cancelandoId === t.turno_id ? 'Cancelando...' : 'Cancelar'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MisTurnos;