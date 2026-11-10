import React from 'react';
import './App.css'; // Importamos los estilos

function App() {
  return (
    <div className="pagina">
      
      {/* Barra de navegación */}
      <nav className="navbar">
        <div className="menu-izquierda">
          <a href="#">Eliminar informacion</a>
        </div>
        <div className="menu-derecha">
          <a href="#">Registrarse</a>
          <a href="#">Iniciar sesión</a>
        </div>
      </nav>

      {/* Sección Hero (con la tarjeta de bienvenida original) */}
      <header className="Grafica">
        <div className="card_grafica">
          <h3>Ubicacion de la grafica del mobimiento de los ahorros del año</h3>
        </div>
      </header>

      {/* Sección Servicios (Formularios) */}
      <main className="servicios">
        <div className="card_Larga">
          <form className="formulario-ahorro">
            <h3>Ingresar ahorro del mes TwT</h3>

            <div className="campo">
              <input type="number" placeholder="Monto" min="0" required />
            </div>

            <div className="campo">
              <input type="text" placeholder="mes" required />
            </div>

            <button type="submit">Enviar</button>
          </form>
        </div>

        <div className="card_Larga">
          <form className="formulario-ahorro">
            <h3>Correccion de equivocaciones</h3>
            <div className="campo">
              <input type="number" placeholder="Monto" min="0" required />
            </div>
            
            <div className="campo">
              <input type="text" placeholder="mes" required />
            </div>

            <div className="campo">
              <select name="categoria" defaultValue="" required>
                <option value="" disabled>Selecciona una categoría...</option>
                <option value="Agregar">Aumentar</option>
                <option value="Restar">Disminuir</option>
              </select>
            </div>

            <button type="submit">Enviar</button>
          </form>
        </div>
      </main>

      {/* Tabla de acciones realizadas */}
      <main className="Tabla_acciones_realizadas">
        <div className="card_T_Acciones"></div>
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