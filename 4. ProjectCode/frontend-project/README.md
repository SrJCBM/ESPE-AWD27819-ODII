📁 **frontend-project** - Estructura completa del Frontend TravelBrain

## 📋 Descripción
Frontend moderno para TravelBrain que consume la API del backend. Incluye diseño responsive, sistema de autenticación, y todas las funcionalidades de planificación de viajes.

## 🎨 Paleta de Colores
- **Primary Green**: #47F59A, #39C070, #2DA65C, #1D7647
- **Secondary Pink**: #E54A7A, #D1297B, #B61554
- **Neutral**: #101110 (negro), #D3DAD5 (gris claro)

## 📦 Estructura

```
frontend-project/
├── public/
│   ├── index.html              # Landing page
│   ├── login.html              # Página de login
│   ├── register.html           # Página de registro
│   ├── dashboard.html          # Dashboard principal
│   ├── planner.html            # Planificador de viajes
│   ├── trips.html              # Lista de viajes
│   ├── destinations.html       # Destinos
│   ├── profile.html            # Perfil de usuario
│   │
│   ├── css/
│   │   ├── variables.css       # ✅ Variables CSS (colores, spacing, etc)
│   │   ├── reset.css           # ✅ CSS Reset
│   │   ├── global.css          # ✅ Estilos globales y utilidades
│   │   ├── landing.css         # ✅ Estilos landing page
│   │   ├── auth.css            # Estilos login/register
│   │   ├── dashboard.css       # Estilos dashboard
│   │   └── planner.css         # Estilos planificador
│   │
│   ├── js/
│   │   ├── config.js           # ✅ Configuración de la app
│   │   ├── utils.js            # ✅ Funciones utilitarias
│   │   ├── landing.js          # ✅ JavaScript landing page
│   │   ├── auth.js             # JavaScript autenticación
│   │   ├── dashboard.js        # JavaScript dashboard
│   │   └── planner.js          # JavaScript planificador
│   │
│   └── assets/
│       ├── images/
│       │   ├── logo.png        # ⚠️ COLOCAR AQUÍ TU LOGO
│       │   ├── estaciones1.png # ⚠️ COLOCAR AQUÍ (hero image)
│       │   └── pan1.png        # ⚠️ COLOCAR AQUÍ (footer image)
│       └── videos/
│           └── videoplayback.mp4 # ⚠️ COLOCAR AQUÍ O USAR LINK
│
├── package.json                # Dependencias (si usas npm)
└── README.md                   # Este archivo
```

## 🚀 Instalación

### Opción 1: Servidor simple con Python
```bash
cd frontend-project/public
python -m http.server 8000
```

### Opción 2: Servidor simple con Node.js
```bash
npm install -g http-server
cd frontend-project/public
http-server -p 8000
```

### Opción 3: Live Server (VS Code Extension)
1. Instalar "Live Server" extension
2. Click derecho en `index.html` > "Open with Live Server"

## 📝 Configuración

### 1. Colocar Assets
Coloca tus archivos en las siguientes ubicaciones:
- `public/assets/images/logo.png` - Tu logo
- `public/assets/images/estaciones1.png` - Imagen de estaciones (hero)
- `public/assets/images/pan1.png` - Imagen panorámica (footer)
- `public/assets/videos/videoplayback.mp4` - Tu video (o usa link)

### 2. Configurar API
Edita `public/js/config.js` si tu backend corre en otro puerto:
```javascript
API_BASE_URL: 'http://localhost:3004' // Cambiar si es necesario
```

### 3. Video
Si prefieres usar un link de video (YouTube, Vimeo, etc.):
1. Abre `public/index.html`
2. Busca la sección `<!-- Video Section -->`
3. Comenta el video local y descomenta el iframe
4. Reemplaza `YOUR_VIDEO_ID` con tu ID de video

## 🎯 Funcionalidades

### ✅ Implementadas
- Landing page responsive con hero section
- Sistema de navegación sticky header
- Footer con redes sociales
- Integración con API de backend
- Utilidades para autenticación (token management)
- Sistema de toasts/notificaciones
- Validación de formularios
- Efectos de scroll y animaciones

### 📝 Por Implementar (siguientes archivos)
- Login page (`login.html`)
- Register page (`register.html`)
- Dashboard principal (`dashboard.html`)
- Planificador de viajes (`planner.html`)
- Lista de viajes (`trips.html`)
- Gestión de destinos (`destinations.html`)
- Perfil de usuario (`profile.html`)

## 🔌 Endpoints API Consumidos

El frontend consume los siguientes endpoints del backend:

### Autenticación
- `POST /api/auth/login` - Login simple
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Destinos
- `GET /destinations` - Obtener destinos
- `POST /destinations` - Crear destino
- `PUT /destinations/:id` - Actualizar destino
- `DELETE /destinations/:id` - Eliminar destino

### Viajes
- `GET /trips` - Obtener viajes
- `POST /trips` - Crear viaje
- `PUT /trips/:id` - Actualizar viaje
- `DELETE /trips/:id` - Eliminar viaje

### Rutas Favoritas
- `GET /favorite-routes` - Obtener rutas
- `POST /favorite-routes` - Crear ruta
- `PUT /favorite-routes/:id` - Actualizar ruta
- `DELETE /favorite-routes/:id` - Eliminar ruta

### Clima
- `GET /weathers` - Historial de búsquedas
- `POST /weather` - Guardar búsqueda

## 🎨 Sistema de Diseño

### Colores Principales
```css
--color-primary: #39C070        /* Verde principal */
--color-primary-light: #47F59A  /* Verde claro */
--color-secondary: #E54A7A      /* Rosa/Magenta */
--bg-primary: #101110           /* Negro de fondo */
--bg-secondary: #242825         /* Gris oscuro */
```

### Tipografía
- **Headings**: Poppins (bold/extrabold)
- **Body**: Inter (regular/medium)

### Componentes Reutilizables
- `.btn` - Botones (primary, secondary, outline, ghost)
- `.card` - Tarjetas de contenido
- `.form-input` - Campos de formulario
- `.toast` - Notificaciones temporales
- `.spinner` - Indicador de carga

## 📱 Responsive
- **Desktop**: 1280px+
- **Tablet**: 768px - 1279px
- **Mobile**: < 768px

## 🔒 Autenticación

El sistema usa JWT tokens:
1. Usuario hace login → recibe token
2. Token se guarda en localStorage
3. Cada request incluye el token en headers
4. Token expira según config del backend

## 🌐 CORS

Asegúrate que el backend tenga habilitado CORS para:
```
http://localhost:8000
```

## 📄 Licencia
© 2025 Overnight Developers Squad II

## 👥 Equipo
Overnight Developers Squad II

---

## 🚧 Próximos Pasos

1. **Colocar assets** (logo.png, estaciones1.png, pan1.png, videoplayback.mp4)
2. **Probar landing page** (abrir index.html en navegador)
3. **Crear páginas restantes** (login, register, dashboard, planner)
4. **Integrar mapas** (Mapbox API)
5. **Agregar conversor de moneda**
6. **Implementar búsqueda de clima**

¿Quieres que continúe con alguna página específica (login, dashboard, planner)?
