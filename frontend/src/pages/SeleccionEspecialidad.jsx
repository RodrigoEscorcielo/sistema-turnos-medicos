// src/pages/SeleccionEspecialidad.jsx
import { useState, useEffect } from 'react';
import { getEspecialidades } from '../api/especialidades';
import { getMedicos } from '../api/medicos';
import { getDisponibilidad } from '../api/agenda';

function SeleccionEspecialidad() {
  const [especialidades, setEspecialidades] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);

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
      getMedicos(seleccionada.id).then(setMedicos);
    }
  }, [seleccionada]);

  useEffect(() => {
    if (medicoSeleccionado) {
      getDisponibilidad(medicoSeleccionado.id).then(setHorarios);
    }
  }, [medicoSeleccionado]);

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

      {medicoSeleccionado && (
        <>
          <h4>Horarios de {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}</h4>
          {horarios.length === 0 ? (
            <p>Sin horarios disponibles.</p>
          ) : (
            <ul>
              {horarios.map((h) => (
                <li key={h.agenda_id}>
                  {h.fecha} — {h.hora_inicio} a {h.hora_fin}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default SeleccionEspecialidad;