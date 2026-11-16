
import React, { useState, useEffect } from 'react';

import './App.css';
import GraficaAhorros from './GraficaAhorros';
import Autenticacion from './Autenticacion';

const API_BASE = 'http://127.0.0.1:8000/api';
const MESES = {
    "1": "Enero",
    "2": "Febrero",
    "3": "Marzo",
    "4": "Abril",
    "5": "Mayo",
    "6": "Junio",
    "7": "Julio",
    "8": "Agosto",
    "9": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
};

const normalizarMes = (valor) => {
    const mes = String(valor).trim().toLowerCase();

    if (Object.hasOwn(MESES, mes)) {
        return MESES[mes];
    }

    return Object.values(MESES).find(
        nombre => nombre.toLowerCase() === mes
    ) || null;
};

const obtenerMensajeErrorDRF = (data) => {
    if (!data || typeof data !== 'object') {
        return 'No se pudo procesar la solicitud.';
    }

    if (typeof data.detail === 'string') {
        return data.detail;
    }

    const primerValor = Object.values(data)[0];

    if (Array.isArray(primerValor) && primerValor.length > 0) {
        return primerValor[0];
    }

    if (typeof primerValor === 'string') {
        return primerValor;
    }

    return 'Error de validación en los datos enviados.';
};

function App() {
    // AUTENTICACIÓN
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [modoInvitado, setModoInvitado] = useState(false);

    // DATOS DE LA APLICACIÓN
    const [datosGrafica, setDatosGrafica] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // FORMULARIO DE INGRESO
    const [formIngreso, setFormIngreso] = useState({
        Monto: '',
        mes: '',
        Descripcion: '',
    });

    // FORMULARIO DE CORRECCIÓN
    const [formCorreccion, setFormCorreccion] = useState({
        Monto: '',
        mes: '',
        Accion: '',
        Descripcion: '',
    });

    // PETICIONES AUTENTICADAS
    const peticionAPI = async (ruta, opciones = {}) => {
        const response = await fetch(`${API_BASE}${ruta}`, {
            ...opciones,
            headers: {
                'Content-Type': 'application/json',
                ...opciones.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(obtenerMensajeErrorDRF(data));
        }

        return data;
    };

    // CARGAR GRÁFICA E HISTORIAL
    const cargarDatos = async () => {
        try {
            const [dataGrafica, dataMovimientos] = await Promise.all([
                peticionAPI('/Datos_Grafica/'),
                peticionAPI('/Movimiento/'),
            ]);

            setDatosGrafica(dataGrafica);
            setMovimientos(dataMovimientos);

        } catch (error) {
            setMensaje(error.message);
        }
    };

    // CARGAR DATOS AL INICIAR SESIÓN
    useEffect(() => {
        if (token) {
            cargarDatos();
        }
    }, [token]);

    // INGRESAR COMO INVITADO
    const entrarComoInvitado = () => {
        setToken(null);
        setUsuario('');
        setModoInvitado(true);

        setDatosGrafica([]);
        setMovimientos([]);
        setMensaje('');
    };

    // INICIAR SESIÓN
    const iniciarSesion = (nuevoToken, nombreUsuario) => {
        setDatosGrafica([]);
        setMovimientos([]);

        setToken(nuevoToken);
        setUsuario(nombreUsuario);
        setModoInvitado(false);

        setMensaje('Sesión iniciada correctamente.');
    };

    // CERRAR SESIÓN O SALIR DEL MODO INVITADO
    const cerrarSesion = () => {
        setToken(null);
        setUsuario('');
        setModoInvitado(false);

        setDatosGrafica([]);
        setMovimientos([]);

        setMensaje('');

        setFormIngreso({
            Monto: '',
            mes: '',
            Descripcion: '',
        });

        setFormCorreccion({
            Monto: '',
            mes: '',
            Accion: '',
            Descripcion: '',
        });
    };

    // CREAR MOVIMIENTO LOCAL PARA INVITADOS
    const crearMovimientoLocal = (mes, accion, monto, descripcion) => {
        return {
            id: Date.now() + Math.random(),
            mes,
            Accion: accion,
            Monto: monto,
            Descripcion: descripcion,
            activo: true,
            Modificado_el: new Date().toISOString(),
        };
    };

    // INGRESAR AHORRO
// INGRESAR AHORRO
    const handleSubmitIngreso = async (e) => {
        e.preventDefault();
        setMensaje('');

        const mesNormalizado = normalizarMes(formIngreso.mes);
        const monto = Number(formIngreso.Monto);
        const descripcion = formIngreso.Descripcion || 'Ingreso desde formulario';

        if (!mesNormalizado) {
            setMensaje('Ingresa un mes válido del 1 al 12 o su nombre.');
            return;
        }

        if (!Number.isInteger(monto) || monto <= 0) {
            setMensaje('El monto debe ser un número entero positivo.');
            return;
        }

        try {
            if (modoInvitado) {
                const existe = datosGrafica.some(
                    dato => normalizarMes(dato.mes) === mesNormalizado
                );

                if (existe) {
                    setMensaje('Ya existe un registro para este mes.');
                    return;
                }

                setDatosGrafica(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        mes: mesNormalizado,
                        MontoTotal: monto,
                    },
                ]);

                setMovimientos(prev => [
                    crearMovimientoLocal(
                        mesNormalizado,
                        'ingresar',
                        monto,
                        descripcion
                    ),
                    ...prev,
                ]);

            } else {
                await peticionAPI('/Movimiento/ingresar/', {
                    method: 'POST',
                    body: JSON.stringify({
                        mes: mesNormalizado,
                        Monto: monto,
                        Descripcion: descripcion,
                    }),
                });

                await cargarDatos();
            }

            setFormIngreso({
                Monto: '',
                mes: '',
                Descripcion: '',
            });

            setMensaje('Ahorro registrado correctamente.');

        } catch (error) {
            setMensaje(error.message);
        }
    };

        // CAMBIAR O ELIMINAR AHORRO
    // CAMBIAR O ELIMINAR AHORRO
    const handleSubmitCorreccion = async (e) => {
        e.preventDefault();
        setMensaje('');

        const { mes, Accion, Monto, Descripcion } = formCorreccion;

        const mesNormalizado = normalizarMes(mes);
        const monto = Number(Monto);

        if (!mesNormalizado || !Accion) {
            setMensaje('Ingresa un mes válido y selecciona una acción.');
            return;
        }

        if (
            Accion === 'cambiar' &&
            (!Number.isInteger(monto) || Monto === '')
        ) {
            setMensaje('Ingresa un monto entero válido.');
            return;
        }

        try {
            if (modoInvitado) {
                const dato = datosGrafica.find(
                    item => normalizarMes(item.mes) === mesNormalizado
                );

                if (!dato) {
                    setMensaje('No existe un registro para ese mes.');
                    return;
                }

                const montoMovimiento = Accion === 'eliminar' ? 0 : monto;

                setDatosGrafica(prev =>
                    prev.map(item => {
                        if (item.id !== dato.id) {
                            return item;
                        }

                        return {
                            ...item,
                            MontoTotal: Accion === 'eliminar'
                                ? 0
                                : item.MontoTotal + monto,
                        };
                    })
                );

                setMovimientos(prev => [
                    crearMovimientoLocal(
                        dato.mes,
                        Accion,
                        montoMovimiento,
                        Descripcion || (
                            Accion === 'eliminar'
                                ? 'Eliminación de monto mensual'
                                : 'Corrección desde formulario'
                        )
                    ),
                    ...prev,
                ]);

            } else {
                const datos = {
                    mes: mesNormalizado,
                    Accion,
                    Descripcion: Descripcion || '',
                };

                if (Accion === 'cambiar') {
                    datos.Monto = monto;
                }

                await peticionAPI('/Movimiento/ajustar/', {
                    method: 'POST',
                    body: JSON.stringify(datos),
                });

                await cargarDatos();
            }

            setFormCorreccion({
                Monto: '',
                mes: '',
                Accion: '',
                Descripcion: '',
            });

            setMensaje(
                Accion === 'eliminar'
                    ? 'Monto reiniciado correctamente.'
                    : 'Monto modificado correctamente.'
            );

        } catch (error) {
            setMensaje(error.message);
        }
    };
    // LIMPIAR TODA LA INFORMACIÓN
    const handleEliminarTodo = async (e) => {
        e.preventDefault();

        const confirmado = window.confirm(
            '¿Seguro que quieres eliminar toda la información? Esta acción no se puede deshacer.'
        );

        if (!confirmado) return;

        try {
            if (modoInvitado) {
                setDatosGrafica([]);
                setMovimientos([]);

            } else {
                await peticionAPI('/limpiar/', {
                    method: 'DELETE',
                });

                await cargarDatos();
            }

            setMensaje('Toda la información fue eliminada correctamente.');

        } catch (error) {
            setMensaje(error.message);
        }
    };

    // MOSTRAR AUTENTICACIÓN
    if (!token && !modoInvitado) {
        return (
            <Autenticacion
                onLogin={iniciarSesion}
                onInvitado={entrarComoInvitado}
            />
        );
    }

    return (
        <div className="pagina">

            {/* BARRA DE NAVEGACIÓN */}
            <nav className="navbar">
                <div className="menu-izquierda">
                    <a href="#eliminar" onClick={handleEliminarTodo}>
                        Eliminar toda la información
                    </a>
                </div>

                <div className="menu-derecha">
                    {modoInvitado ? (
                        <>
                            <span>Modo invitado</span>
                            <a
                                href="#salir"
                                onClick={(e) => {
                                    e.preventDefault();
                                    cerrarSesion();
                                }}
                            >
                                Salir
                            </a>
                        </>
                    ) : (
                        <>
                            <span>Hola, {usuario}</span>
                            <a
                                href="#cerrar"
                                onClick={(e) => {
                                    e.preventDefault();
                                    cerrarSesion();
                                }}
                            >
                                Cerrar sesión
                            </a>
                        </>
                    )}
                </div>
            </nav>

            {/* SECCIÓN GRÁFICA */}
            <header className="Grafica">

                <div className="card_grafica">
                    <GraficaAhorros datosGrafica={datosGrafica} />
                </div>

                {/* TARJETA DE MENSAJES */}
                {mensaje && (
                    <div className="alerta-api">
                        {mensaje}
                    </div>
                )}

            </header>

            {/* SECCIÓN FORMULARIOS */}
            <main className="servicios">

                {/* FORMULARIO DE INGRESO */}
                <div className="card_Larga">
                    <form
                        className="formulario-ahorro"
                        onSubmit={handleSubmitIngreso}
                    >
                        <h3>Ingresar ahorro del mes TwT</h3>

                        <div className="campo">
                            <input
                                type="number"
                                name="Monto"
                                placeholder="Monto"
                                min="1"
                                value={formIngreso.Monto}
                                onChange={(e) =>
                                    setFormIngreso({
                                        ...formIngreso,
                                        Monto: e.target.value,
                                    })
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
                                    setFormIngreso({
                                        ...formIngreso,
                                        mes: e.target.value,
                                    })
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
                                    setFormIngreso({
                                        ...formIngreso,
                                        Descripcion: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button type="submit">Enviar</button>
                    </form>
                </div>

                {/* FORMULARIO DE CORRECCIÓN */}
                <div className="card_Larga">
                    <form
                        className="formulario-ahorro"
                        onSubmit={handleSubmitCorreccion}
                    >
                        <h3>Correccion de equivocaciones</h3>

                        <div className="campo">
                            <input
                                type="number"
                                name="Monto"
                                value={
                                    formCorreccion.Accion === 'eliminar'
                                        ? 0
                                        : formCorreccion.Monto
                                }
                                placeholder="Monto"
                                disabled={formCorreccion.Accion === 'eliminar'}
                                required={formCorreccion.Accion !== 'eliminar'}
                                onChange={(e) =>
                                    setFormCorreccion({
                                        ...formCorreccion,
                                        Monto: e.target.value,
                                    })
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
                                    setFormCorreccion({
                                        ...formCorreccion,
                                        mes: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="campo">
                            <select
                                name="Accion"
                                value={formCorreccion.Accion}
                                onChange={(e) =>
                                    setFormCorreccion({
                                        ...formCorreccion,
                                        Accion: e.target.value,
                                    })
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

            {/* TABLA DE ACCIONES REALIZADAS */}
            <main className="Tabla_acciones_realizadas">
                <div className="card_T_Acciones">
                    <h3>Acciones realizadas</h3>

                    {movimientos.length === 0 ? (
                        <p>No hay movimientos registrados.</p>
                    ) : (
                        <div className="tabla-responsive">
                            <table className="tabla-movimientos">
                                <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Acción</th>
                                        <th>Monto</th>
                                        <th>Descripción</th>
                                        <th>Fecha y hora</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {movimientos.map((mov) => (
                                        <tr key={mov.id}>
                                            <td>{mov.mes}</td>
                                            <td>{mov.Accion}</td>
                                            <td>
                                                ${Number(mov.Monto).toLocaleString('es-CL')}
                                            </td>
                                            <td>{mov.Descripcion}</td>
                                            <td>
                                                {mov.Modificado_el
                                                    ? new Date(mov.Modificado_el).toLocaleString('es-CL')
                                                    : 'Sin fecha'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            {/* PIE DE PÁGINA */}
            <nav className="piePagina">
            </nav>

        </div>
    );
}

export default App;
