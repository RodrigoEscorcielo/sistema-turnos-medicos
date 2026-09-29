// src/pages/SeleccionEspecialidad.jsx
import { useState, useEffect } from 'react';
import { getEspecialidades } from '../api/especialidades';

function SeleccionEspecialidad() {
  const [especialidades, setEspecialidades] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getEspecialidades().then((data) => {
      setEspecialidades(data);
      setCargando(false);
    });
  }, []);

  if (cargando) return <p>Cargando especialidades...</p>;

  return (
    <div>
      <h2>Elegí una especialidad</h2>
      <ul>
        {especialidades.map((esp) => (
          <li key={esp.id}>
            <button onClick={() => setSeleccionada(esp)}>
              {esp.nombre}
            </button>
          </li>
        ))}
      </ul>

      {seleccionada && (
        <p>Especialidad seleccionada: <strong>{seleccionada.nombre}</strong></p>
      )}
    </div>
  );
}

export default SeleccionEspecialidad;