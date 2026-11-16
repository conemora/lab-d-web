
import React, { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

function Autenticacion({ onLogin, onInvitado }) {
  const [modo, setModo] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const obtenerError = (data) => {
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    const primerValor = Object.values(data)[0];

    if (Array.isArray(primerValor)) {
      return primerValor[0];
    }

    return 'No se pudo completar la operación.';
  };

  const iniciarSesion = async () => {
    const respuesta = await fetch(`${API_BASE}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(obtenerError(data));
    }

    onLogin(data.access, username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje('');
    setCargando(true);

    try {
      if (modo === 'registro') {
        const respuesta = await fetch(`${API_BASE}/registro/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(obtenerError(data));
        }
      }

      // Después del registro también iniciamos sesión
      await iniciarSesion();

    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="autenticacion">
      <form
        className="formulario-autenticacion"
        onSubmit={handleSubmit}
      >
        <h3>
          {modo === 'login'
            ? 'Iniciar sesión'
            : 'Crear cuenta'}
        </h3>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          maxLength={150}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mensaje && (
          <p className="mensaje-autenticacion">
            {mensaje}
          </p>
        )}

        <button type="submit" disabled={cargando}>
          {cargando
            ? 'Procesando...'
            : modo === 'login'
              ? 'Ingresar'
              : 'Registrarse'}
        </button>

        <p>
          {modo === 'login'
            ? '¿No tienes una cuenta?'
            : '¿Ya tienes una cuenta?'}
        </p>

        <button
          type="button"
          onClick={() => {
            setModo(modo === 'login' ? 'registro' : 'login');
            setMensaje('');
          }}
        >
          {modo === 'login'
            ? 'Crear cuenta'
            : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={onInvitado}
        >
          Continuar como invitado
        </button>
      </form>
    </div>
  );
}

export default Autenticacion;
