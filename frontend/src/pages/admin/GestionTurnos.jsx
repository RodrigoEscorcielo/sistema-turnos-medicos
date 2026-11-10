import { useState, useEffect } from 'react';
import { getEspecialidades } from '../../api/especialidades';
import { getMedicos } from '../../api/medicos';
import { getDisponibilidad } from '../../api/agenda';
import { getPacientes, getTurnosAdmin, crearTurnoAdmin, cancelarTurnoAdmin } from '../../api/admin';

const MENSAJES_ERROR = {
  horario_no_disponible: 'Ese horario ya no está disponible. Elegí otro.',
  paciente_no_encontrado: 'El paciente seleccionado no existe.',
  turno_no_encontrado: 'El turno no existe.',
  turno_ya_cancelado: 'El turno ya estaba cancelado.',
  datos_invalidos: 'Revisá el filtro de fecha.',
};

function mensajeDeError(err, porDefecto) {
  return MENSAJES_ERROR[err.response?.data?.error] || porDefecto;
}

function GestionTurnos() {
  // Datos para el alta
  const [pacientes, setPacientes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [agendaId, setAgendaId] = useState('');
  const [reservando, setReservando] = useState(false);
  const [mensajeAlta, setMensajeAlta] = useState(null);

  // Listado
  const [turnos, setTurnos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [errorListado, setErrorListado] = useState(null);
  const [cancelandoId, setCancelandoId] = useState(null);

  useEffect(() => {
    getPacientes().then(setPacientes).catch(() => setMensajeAlta({ error: true, texto: 'No se pudieron cargar los pacientes.' }));
    getEspecialidades().then(setEspecialidades).catch(() => setMensajeAlta({ error: true, texto: 'No se pudieron cargar las especialidades.' }));
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [filtroFecha]);

  useEffect(() => {
    setMedicoId('');
    setMedicos([]);
    if (especialidadId) getMedicos(Number(especialidadId)).then(setMedicos);
  }, [especialidadId]);

  useEffect(() => {
    setAgendaId('');
    setHorarios([]);
    if (medicoId) getDisponibilidad(Number(medicoId)).then(setHorarios);
  }, [medicoId]);

  function cargarTurnos() {
    setCargandoTurnos(true);
    setErrorListado(null);
    getTurnosAdmin(filtroFecha ? { fecha: filtroFecha } : {})
      .then(setTurnos)
      .catch((err) => setErrorListado(mensajeDeError(err, 'No se pudieron cargar los turnos.')))
      .finally(() => setCargandoTurnos(false));
  }

  async function handleReservar(e) {
    e.preventDefault();
    setReservando(true);
    setMensajeAlta(null);
    try {
      const turno = await crearTurnoAdmin(Number(agendaId), Number(pacienteId));
      setMensajeAlta({ error: false, texto: `Turno #${turno.turno_id} reservado correctamente.` });
      setAgendaId('');
      getDisponibilidad(Number(medicoId)).then(setHorarios);
      cargarTurnos();
    } catch (err) {
      setMensajeAlta({ error: true, texto: mensajeDeError(err, 'No se pudo reservar el turno.') });
    } finally {
      setReservando(false);
    }
  }

  async function handleCancelar(turnoId) {
    const motivo = window.prompt('Motivo de la cancelación (opcional):');
    if (motivo === null) return; // el administrativo apretó "Cancelar" en el cuadro

    setCancelandoId(turnoId);
    try {
      await cancelarTurnoAdmin(turnoId, motivo.trim());
      cargarTurnos();
      if (medicoId) getDisponibilidad(Number(medicoId)).then(setHorarios);
    } catch (err) {
      alert(mensajeDeError(err, 'No se pudo cancelar el turno.'));
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <div>
      <h2>Nuevo turno</h2>
      <form onSubmit={handleReservar}>
        <div>
          <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required>
            <option value="">Elegí un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre} (credencial {p.nro_credencial})
              </option>
            ))}
          </select>
        </div>
        <div>
          <select value={especialidadId} onChange={(e) => setEspecialidadId(e.target.value)} required>
            <option value="">Elegí una especialidad</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>{esp.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required disabled={!especialidadId}>
            <option value="">Elegí un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>
            ))}
          </select>
        </div>
        <div>
          <select value={agendaId} onChange={(e) => setAgendaId(e.target.value)} required disabled={!medicoId}>
            <option value="">
              {medicoId && horarios.length === 0 ? 'Sin horarios disponibles' : 'Elegí un horario'}
            </option>
            {horarios.map((h) => (
              <option key={h.agenda_id} value={h.agenda_id}>
                {h.fecha} — {h.hora_inicio} a {h.hora_fin}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={reservando}>{reservando ? 'Reservando...' : 'Reservar'}</button>
      </form>
      {mensajeAlta && <p style={{ color: mensajeAlta.error ? 'red' : 'green' }}>{mensajeAlta.texto}</p>}

      <h2>Turnos</h2>
      <div>
        <label>Fecha <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} /></label>
        {filtroFecha && <button onClick={() => setFiltroFecha('')}>Ver todos</button>}
      </div>

      {cargandoTurnos && <p>Cargando turnos...</p>}
      {errorListado && <p style={{ color: 'red' }}>{errorListado}</p>}
      {!cargandoTurnos && !errorListado && turnos.length === 0 && <p>No hay turnos.</p>}

      {!cargandoTurnos && !errorListado && turnos.length > 0 && (
        <table style={{ margin: '0 auto' }}>
          <thead>
            <tr>
              <th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th><th>Especialidad</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.turno_id}>
                <td>{t.fecha}</td>
                <td>{t.hora_inicio}</td>
                <td>{t.paciente} ({t.nro_credencial})</td>
                <td>{t.medico}</td>
                <td>{t.especialidad}</td>
                <td>{t.estado}{t.motivo ? ` — ${t.motivo}` : ''}</td>
                <td>
                  {t.estado === 'confirmado' && (
                    <button disabled={cancelandoId === t.turno_id} onClick={() => handleCancelar(t.turno_id)}>
                      {cancelandoId === t.turno_id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GestionTurnos;
