import { useState, useEffect } from 'react';
import { getEspecialidades } from '../api/especialidades';
import { getMedicos } from '../api/medicos';

function SeleccionEspecialidad() {
  const [especialidades, setEspecialidades] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getEspecialidades().then((data) => {
      setEspecialidades(data);
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (seleccionada) {
      getMedicos(seleccionada.id).then(setMedicos);
    }
  }, [seleccionada]);

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
              <li key={m.id}>{m.nombre} {m.apellido}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default SeleccionEspecialidad;