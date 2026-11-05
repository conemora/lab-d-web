# # lab-d-web
> Inicio del proyecto full-stack: repositorio, Django, modelo y vista, e integración con React
## 1. Descripción del proyecto
- **Problema o necesidad** que resuelve (contexto real).
- **Usuarios objetivo** y qué podrán hacer en la aplicación.
- **Funcionalidades previstas** (lista breve) y **funcionalidades ya implementadas**.
## 2. Equipo
| Integrante | Rol | Usuario GitHub |
|---|---|---|
| Nombre Apellido | Backend / Frontend / Documentación | @usuario |
## 3. Stack y versiones
| Tecnología | Versión |
|---|---|
| Python | (salida de python --version) |
| Django | (salida de django --version) |
| Node.js / npm | (versiones) |
| React / Vite | (según package.json) |
| Base de datos | SQLite |
## 4. Arquitectura
Diagrama o descripción del flujo Navegador -> React -> Django -> SQLite.
Estrategia de integración React-Django elegida y su justificación.
## 5. Estructura del repositorio
Árbol de carpetas comentado (backend/, frontend/, docs/).
## 6. Lo implementado hasta ahora (Laboratorio 7)
### Modelo de datos
| Campo | Tipo Django | Descripción |
|---|---|---|
| nombre | CharField(100) | ... |
### Endpoints
| Método | Ruta | Descripción | Ejemplo de respuesta |
|---|---|---|---|
| GET | /api/servicios/ | Lista los servicios activos | (JSON) |
### Panel de administración
Qué modelos están registrados y cómo se accede (/admin/).
## 7. Configuración de Django
- Entorno virtual: comandos para crearlo y activarlo (Windows y macOS/Linux).
- Instalación: pip install -r requirements.txt
- Cambios realizados en settings.py y su motivo (INSTALLED_APPS, LANGUAGE_CODE, TIME_ZONE,
DATABASES).
- Comandos: migrate, createsuperuser, runserver.
- URLs del backend (API y admin).
## 8. Configuración de React
- Comando de creación del proyecto y plantilla utilizada.
- Instalación y scripts (npm install, npm run dev, npm run build).
- Configuración de integración con Django (proxy o CORS) y su explicación.
- Puerto y URL de desarrollo.
## 9. Investigación: integración React-Django
Respuestas a las preguntas guía, tabla comparativa, decisión y fuentes.
## 10. Cómo ejecutar el proyecto completo
Pasos numerados, probados desde cero. Indica qué terminal usa cada servidor.
## 11. Capturas
Admin con datos, JSON de /api/servicios/, React en ejecución (carpeta docs/img/).
## 12. Próximos pasos
Qué se construirá en las siguientes semanas (DRF, CRUD, autenticación, dashboard).
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
