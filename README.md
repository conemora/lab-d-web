
# lab-d-web

> Aplicación web full-stack para gestionar ahorros mensuales, registrar movimientos y visualizar la evolución del dinero mediante gráficos.

## 1. Descripción del proyecto

El proyecto consiste en desarrollar una web que permita llevar un control de los ahorros personales.

La aplicación permite registrar los montos ahorrados durante cada mes, realizar modificaciones sobre los saldos existentes y consultar un historial de las operaciones realizadas.

**Problema o necesidad que resuelve:**

Muchas personas necesitan llevar un registro de sus ahorros, pero no cuentan con una herramienta sencilla que permita visualizar cuánto dinero han acumulado, modificar sus registros y consultar sus movimientos.

**Usuarios objetivo:**

- Personas que desean administrar sus ahorros mensuales.
- Usuarios que necesitan consultar el historial de sus movimientos.
- Usuarios que desean visualizar sus ahorros mediante gráficos.

**Funcionalidades implementadas:**

- Registro de usuarios.
- Inicio y cierre de sesión.
- Autenticación mediante JWT.
- Modo invitado sin almacenamiento persistente.
- Registro de ahorros mensuales.
- Modificación de los montos existentes.
- Reinicio de los montos mensuales.
- Eliminación de todos los registros.
- Historial de movimientos con fecha y hora.
- Visualización de los ahorros mediante gráficos.
- Validación de meses y montos ingresados.
- Separación de los datos según el usuario autenticado.

## 2. Equipo

| Integrante | Rol | Usuario GitHub |
|---|---|---|
| Franco Valenzuela | Backend / Frontend / Documentación | @conemora |

## 3. Stack y versiones

| Tecnología | Versión / Herramienta |
|---|---|
| Python | 3.14.7 |
| Django | 6.1.1 |
| Django REST Framework | REST API |
| Simple JWT | Autenticación mediante JWT |
| Node.js / npm | 11.17.0 (según configuración inicial) |
| React / Vite | 8.3.0 (según configuración inicial) |
| Base de datos | SQLite |
| Lenguajes frontend | JavaScript, HTML y CSS |

## 4. Arquitectura

La aplicación utiliza una arquitectura cliente-servidor, separando el frontend del backend.

**Flujo de funcionamiento:**

Navegador → React → Django REST Framework → SQLite

**Frontend:**

React se encarga de mostrar la interfaz, recibir los datos ingresados por el usuario, realizar validaciones y representar los ahorros mediante gráficos.

**Backend:**

Django REST Framework administra las solicitudes, valida la información, procesa las operaciones del CRUD y controla el acceso a los datos.

**Base de datos:**

SQLite almacena los usuarios, los registros de ahorros y el historial de movimientos.

**Integración React-Django:**

La comunicación se realiza mediante solicitudes HTTP utilizando `fetch()` y respuestas en formato JSON.

Para las operaciones protegidas se utiliza autenticación JWT. El token de acceso se envía en el encabezado Authorization mediante el esquema Bearer.

**Autenticación:**

- Los usuarios pueden registrarse e iniciar sesión.
- Los usuarios autenticados solamente pueden acceder a sus propios registros.
- El modo invitado utiliza estados locales de React.
- Los datos del invitado no se almacenan en SQLite ni en el almacenamiento persistente del navegador.

## 5. Estructura del repositorio

```text
lab-d-web/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   │
│   ├── catalogo/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── .env
│   ├── .venv/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Autenticacion.jsx
│   │   └── GraficaAhorros.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

## 6. Lo implementado hasta ahora (Laboratorio 7)

### Modelo de datos

La aplicación utiliza dos modelos principales para administrar los ahorros.

**Modelo Movimiento**

| Campo | Tipo Django | Descripción |
|---|---|---|
| id | AutoField | Identificador del movimiento |
| usuario | ForeignKey | Usuario propietario del movimiento |
| mes | CharField(max_length=10) | Mes asociado al movimiento |
| Accion | CharField(max_length=9) | Operación realizada |
| Monto | IntegerField | Monto involucrado en la operación |
| Descripcion | TextField(max_length=200) | Descripción del movimiento |
| activo | BooleanField | Estado del registro |
| Modificado_el | DateTimeField(auto_now_add=True) | Fecha y hora de creación |

**Modelo Datos_Grafica**

| Campo | Tipo Django | Descripción |
|---|---|---|
| id | AutoField | Identificador del registro |
| usuario | ForeignKey | Usuario propietario del registro |
| mes | CharField(max_length=10) | Mes del ahorro |
| MontoTotal | IntegerField | Saldo acumulado del mes |

### Operaciones CRUD

| Operación | Descripción |
|---|---|
| GET | Consultar los datos de la gráfica y el historial |
| Ingresar | Crear un nuevo ahorro mensual y registrar el movimiento |
| Cambiar | Sumar o restar un monto al saldo existente |
| Eliminar | Reiniciar el saldo de un mes a cero |
| Limpiar | Eliminar todos los movimientos y datos de la gráfica del usuario |

### Validaciones

- Los meses aceptados son del 1 al 12 o sus nombres correspondientes.
- Los números ingresados se convierten a nombres de meses.
- No se permite registrar dos ahorros para el mismo mes.
- Los montos de ingreso deben ser números enteros positivos.
- Las modificaciones permiten utilizar montos positivos o negativos.
- No se puede modificar un mes que no tenga un registro previo.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/registro/ | Crear una cuenta de usuario |
| POST | /api/token/ | Iniciar sesión y obtener tokens JWT |
| POST | /api/token/refresh/ | Renovar el token de acceso |
| GET | /api/Datos_Grafica/ | Consultar los datos de la gráfica |
| GET | /api/Movimiento/ | Consultar el historial de movimientos |
| POST | /api/Movimiento/ingresar/ | Registrar un nuevo ahorro |
| POST | /api/Movimiento/ajustar/ | Cambiar o eliminar el saldo mensual |
| DELETE | /api/limpiar/ | Eliminar los registros del usuario |

Las rutas protegidas requieren un token JWT válido, excepto el registro y la obtención inicial de tokens.

### Panel de administración

Django incluye un panel administrativo que permite gestionar los datos registrados en la base de datos.

Se puede acceder mediante:

`http://127.0.0.1:8000/admin/`

Desde este panel se puede administrar a los usuarios y consultar los registros de la aplicación, según los modelos registrados en Django Admin.

## 7. Configuración de Django

### Requisitos

- Python instalado.
- pip.
- Git.
- Un entorno virtual de Python.

### Crear y activar el entorno virtual

Desde la carpeta `backend`:

**Windows:**

```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Instalar dependencias

```bash
pip install -r requirements.txt
```

### Variables de entorno

Crear un archivo `.env` en la carpeta `backend`, al mismo nivel que `manage.py`.

```env
DJANGO_SECRET_KEY=tu_clave_secreta
DJANGO_DEBUG=True
```
### Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### Crear administrador

```bash
python manage.py createsuperuser
```

### Iniciar el servidor

```bash
python manage.py runserver
```

El backend estará disponible en:

`http://127.0.0.1:8000/`

### Configuración de seguridad

- Las rutas protegidas utilizan JWT.
- Las contraseñas se gestionan mediante el sistema de autenticación de Django.
- La clave secreta se carga desde variables de entorno.
- El archivo `.env` está excluido del repositorio mediante `.gitignore`.

## 8. Configuración de React

### Requisitos

- Node.js.
- npm.

### Instalar dependencias

Desde la carpeta `frontend`:

```bash
npm install
```

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en la dirección local que indique Vite, normalmente:

`http://localhost:5173/`

### Construir el proyecto

```bash
npm run build
```

### Integración con Django

React utiliza solicitudes `fetch()` para comunicarse con Django REST Framework.

Las solicitudes protegidas incluyen el token JWT:

```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}
```

La aplicación utiliza estados de React para administrar la información del usuario, los formularios, los movimientos y los datos de la gráfica.

## 9. Investigación: integración React-Django

### ¿Cómo se comunican React y Django?

React y Django se comunican mediante solicitudes HTTP. React envía peticiones al backend y Django procesa la información, interactúa con la base de datos y devuelve respuestas JSON.

### ¿Qué alternativas existen para integrar ambos frameworks?

| Alternativa | Descripción | Ventajas | Desventajas |
|---|---|---|---|
| Django Templates | Django genera directamente las páginas HTML | Integración sencilla | Menor separación entre frontend y backend |
| React + Django REST Framework | React administra la interfaz y Django proporciona una API | Separación de responsabilidades y flexibilidad | Requiere configurar la comunicación entre ambos |
| Django con aplicaciones frontend integradas | Se incorpora el frontend dentro del proyecto Django | Centraliza parte de la configuración | Puede complicar el desarrollo independiente |

### ¿Qué alternativa se eligió?

Se eligió React junto con Django REST Framework.

### Justificación

Esta alternativa permite desarrollar el frontend y el backend de manera independiente.

React se encarga de la experiencia visual y la interacción del usuario, mientras Django administra la lógica del negocio, la autenticación y el almacenamiento de datos.

Además, permite ampliar la aplicación en el futuro sin tener que reconstruir toda su arquitectura.

### Fuentes de consulta

- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vite.dev/
- Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/

## 10. Cómo ejecutar el proyecto completo

Para ejecutar el proyecto se necesitan dos terminales independientes.

### Terminal 1: Backend

1. Abrir una terminal.
2. Acceder a la carpeta del proyecto:

```powershell
cd lab-d-web/backend
```

3. Activar el entorno virtual:

```powershell
.venv\Scripts\activate
```

4. Instalar las dependencias si todavía no están instaladas:

```powershell
pip install -r requirements.txt
```

5. Aplicar las migraciones:

```powershell
python manage.py migrate
```

6. Iniciar Django:

```powershell
python manage.py runserver
```

### Terminal 2: Frontend

1. Abrir una segunda terminal.
2. Acceder a la carpeta frontend:

```powershell
cd lab-d-web/frontend
```

3. Instalar las dependencias si todavía no están instaladas:

```bash
npm install
```

4. Iniciar React:

```bash
npm run dev
```

5. Abrir en el navegador la dirección proporcionada por Vite.

### Acceso a la aplicación

- Frontend: http://localhost:5173/
- Backend: http://127.0.0.1:8000/
- Administración Django: http://127.0.0.1:8000/admin/
