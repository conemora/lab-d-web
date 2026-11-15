import React, { useState, useEffect } from 'react';
import './App.css';
import GraficaAhorros from './GraficaAhorros';

const API_BASE = 'http://127.0.0.1:8000/api';

const obtenerMensajeErrorDRF = (data) => {
  if (!data || typeof data !== 'object') {
    return 'No se pudo procesar la solicitud.';
  }
  if (Array.isArray(data.mes) && data.mes.length > 0) return data.mes[0];
  if (typeof data.mes === 'string') return data.mes;

  if (Array.isArray(data.Monto) && data.Monto.length > 0) return data.Monto[0];
  if (typeof data.Monto === 'string') return data.Monto;

  if (Array.isArray(data.Descripcion) && data.Descripcion.length > 0) {
    return data.Descripcion[0];
  }
  if (typeof data.Descripcion === 'string') return data.Descripcion;

  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0];
  }
  if (typeof data.detail === 'string') return data.detail;

  const primerValor = Object.values(data)[0];
  if (Array.isArray(primerValor) && primerValor.length > 0) return primerValor[0];
  if (typeof primerValor === 'string') return primerValor;

  return 'Error de validación en los datos enviados.';
};

function App() {
  // 1. Estados para datos provenientes de Django
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // 2. Estados para Formulario 1: Ingresar ahorro
  const [formIngreso, setFormIngreso] = useState({
    Monto: '',
    mes: '',
    Descripcion: '',
  });

  // 3. Estados para Formulario 2: Corrección de equivocaciones
  const [formCorreccion, setFormCorreccion] = useState({
    Monto: '',
    mes: '',
    Accion: '',
    Descripcion: '',
  });

  // 4. Obtener datos desde Django (GET)
  const cargarDatos = async () => {
    try {
      const [resGrafica, resMov] = await Promise.all([
        fetch(`${API_BASE}/Datos_Grafica/`),
        fetch(`${API_BASE}/Movimiento/`),
      ]);

      if (resGrafica.ok) {
        const dataGrafica = await resGrafica.json();
        setDatosGrafica(dataGrafica);
      }

      if (resMov.ok) {
        const dataMov = await resMov.json();
        setMovimientos(dataMov);
      }
    } catch (error) {
      setMensaje('No se pudo conectar con el servidor Django.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 5. Enviar Formulario 1 (POST /api/Movimiento/ -> Accion: "ingresar")
  const handleSubmitIngreso = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const response = await fetch(`${API_BASE}/Movimiento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: formIngreso.mes,
          Accion: 'ingresar',
          Monto: Number(formIngreso.Monto),
          Descripcion: formIngreso.Descripcion || 'Ingreso desde formulario',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensaje(obtenerMensajeErrorDRF(data));
        return;
      }

      setFormIngreso({ Monto: '', mes: '', Descripcion: '' });
      setMensaje('Movimiento guardado correctamente.');
      cargarDatos(); // Refresca gráfica y tabla
    } catch (error) {
      setMensaje('Error de red al enviar el ingreso.');
    }
  };

  // 6. Enviar Formulario 2 (POST /api/Movimiento/cambiar/ o DELETE /api/Movimiento/eliminar/)
  const handleSubmitCorreccion = async (e) => {
    e.preventDefault();
    setMensaje('');

    const { mes, Accion, Monto, Descripcion } = formCorreccion;

    try {
      let response;

      if (Accion === 'eliminar') {
        const mesQuery = encodeURIComponent(mes);
        response = await fetch(`${API_BASE}/Movimiento/eliminar/?mes=${mesQuery}`, {
          method: 'DELETE',
        });
      } else {
        response = await fetch(`${API_BASE}/Movimiento/cambiar/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mes,
            Accion: 'cambiar',
            Monto: Number(Monto),
            Descripcion: Descripcion || 'Corrección desde formulario',
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setMensaje(obtenerMensajeErrorDRF(data));
        return;
      }

      setFormCorreccion({ Monto: '', mes: '', Accion: '', Descripcion: '' });
      setMensaje('Corrección registrada.');
      cargarDatos(); // Refresca gráfica y tabla
    } catch (error) {
      setMensaje('Error de red al enviar la corrección.');
    }
  };

  const handleEliminarTodo = async (e) => {
    e.preventDefault();

    const confirmado = window.confirm(
      '¿Seguro que quieres eliminar la informacion de los movimientos? Esta acción no se puede deshacer.'
    );
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_BASE}/limpiar/`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMensaje(obtenerMensajeErrorDRF(data) || 'No se pudo eliminar la información.');
        return;
      }

      setMensaje('Información eliminada.');
      await cargarDatos();
    } catch (error) {
      setMensaje('Error de red al intentar eliminar la información.');
    }
  };

  return (
    <div className="pagina">
      {/* Barra de navegación */}
      <nav className="navbar">
        <div className="menu-izquierda">
          <a href="#eliminar" onClick={handleEliminarTodo}>
            Eliminar toda la información
          </a>
        </div>
        <div className="menu-derecha">
          <a href="#">Registrarse</a>
          <a href="#">Iniciar sesión</a>
        </div>
      </nav>

      {mensaje && <p className="alerta-api">{mensaje}</p>}

      {/* Sección Gráfica */}
      <header className="Grafica">
        <div className="card_grafica">
              <GraficaAhorros datosGrafica={datosGrafica} />
        </div>
      </header>

      {/* Sección Formularios */}
      <main className="servicios">
        <div className="card_Larga">
          <form className="formulario-ahorro" onSubmit={handleSubmitIngreso}>
            <h3>Ingresar ahorro del mes TwT</h3>

            <div className="campo">
              <input
                type="number"
                name="Monto"
                placeholder="Monto"
                min="1"
                value={formIngreso.Monto}
                onChange={(e) =>
                  setFormIngreso({ ...formIngreso, Monto: e.target.value })
                }
                required
              />
            </div>

            <div className="campo">
              <input
                type="text"
                name="mes"
                placeholder="mes"
                value={formIngreso.mes}
                onChange={(e) =>
                  setFormIngreso({ ...formIngreso, mes: e.target.value })
                }
                required
              />
            </div>

            <div className="campo">
              <input
                type="text"
                name="Descripcion"
                placeholder="Descripción (opcional)"
                maxLength={200}
                value={formIngreso.Descripcion}
                onChange={(e) =>
                  setFormIngreso({ ...formIngreso, Descripcion: e.target.value })
                }
              />
            </div>

            <button type="submit">Enviar</button>
          </form>
        </div>

        <div className="card_Larga">
          <form className="formulario-ahorro" onSubmit={handleSubmitCorreccion}>
            <h3>Correccion de equivocaciones</h3>

            <div className="campo">
              <input
                type="number"
                name="Monto"
                value={formCorreccion.Accion === 'eliminar' ? 0 : formCorreccion.Monto}
                placeholder="Monto"
                disabled={formCorreccion.Accion === 'eliminar'}
                required={formCorreccion.Accion !== 'eliminar'}
                onChange={(e) =>
                  setFormCorreccion({ ...formCorreccion, Monto: e.target.value })
                }
              />
            </div>

            <div className="campo">
              <input
                type="text"
                name="mes"
                placeholder="mes"
                value={formCorreccion.mes}
                onChange={(e) =>
                  setFormCorreccion({ ...formCorreccion, mes: e.target.value })
                }
                required
              />
            </div>

            <div className="campo">
              <select
                name="Accion"
                value={formCorreccion.Accion}
                onChange={(e) =>
                  setFormCorreccion({ ...formCorreccion, Accion: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Selecciona una acción...
                </option>
                <option value="cambiar">Cambiar</option>
                <option value="eliminar">Eliminar</option>
              </select>
            </div>

            <div className="campo">
              <input
                type="text"
                name="Descripcion"
                placeholder="Descripción (opcional)"
                maxLength={200}
                value={formCorreccion.Descripcion}
                onChange={(e) =>
                  setFormCorreccion({
                    ...formCorreccion,
                    Descripcion: e.target.value,
                  })
                }
              />
            </div>

            <button type="submit">Enviar</button>
          </form>
        </div>
      </main>

      {/* Tabla de acciones realizadas */}
      <main className="Tabla_acciones_realizadas">
        <div className="card_T_Acciones">
          <h3>Acciones realizadas</h3>
          {movimientos.length === 0 ? (
            <p>No hay movimientos registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Acción</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td>{mov.mes}</td>
                    <td>{mov.Accion}</td>
                    <td>${mov.Monto}</td>
                    <td>{mov.Descripcion}</td>
                    <td>{mov.Fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Pie de página */}
      <nav className="piePagina">
        <a href="#!">sigma</a>
        <a href="#!">void</a>
        <a href="#!">prime</a>
        <a href="#!">chat</a>
      </nav>
    </div>
  );
}

export default App;