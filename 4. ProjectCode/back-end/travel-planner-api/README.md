# Travel Planner API

Guía rápida de las rutas disponibles para que puedas importarlas o consultarlas desde Postman.

## Base URL

- Desarrollo local: `http://localhost:8080`

## Endpoints

### Healthcheck
- **GET** `/health` — Verifica que el servicio esté activo.

### Autenticación (`/auth`)
- **POST** `/auth/register` — Crea un usuario nuevo. Cuerpo JSON: `{ "name", "email", "password" }`.
- **POST** `/auth/login` — Inicia sesión y devuelve un `token` JWT. Cuerpo JSON: `{ "email", "password" }`.

### Viajes (`/trips`)
> Todas las rutas requieren el encabezado `Authorization: Bearer <token>`.
- **POST** `/trips` — Crea un viaje. Cuerpo JSON: `{ "name", "startDate", "endDate", "budget"? }`.
- **GET** `/trips` — Lista los viajes del usuario autenticado.
- **GET** `/trips/:id` — Obtiene un viaje por ID.
- **PUT** `/trips/:id` — Actualiza un viaje.
- **DELETE** `/trips/:id` — Elimina un viaje y sus itinerarios asociados.

#### Itinerarios por viaje
- **POST** `/trips/:tripId/itineraries` — Crea un itinerario. Cuerpo JSON: `{ "day", "notes"?, "activities"?, "destination"? }`.
- **GET** `/trips/:tripId/itineraries` — Lista los itinerarios de un viaje.
- **PUT** `/trips/:tripId/itineraries/:itId` — Actualiza un itinerario.
- **DELETE** `/trips/:tripId/itineraries/:itId` — Elimina un itinerario.

### Integraciones externas (`/integrations`)
- **GET** `/integrations/country/:code` — Información de país por código ISO (query opcional `fields`).
- **GET** `/integrations/rates` — Tasas de cambio. Query: `base` (opcional), `symbols` (opcional).
- **GET** `/integrations/geocode` — Geocodificación. Query obligatoria: `q`.
- **GET** `/integrations/weather` — Pronóstico. Query obligatorias: `lat`, `lon`.
