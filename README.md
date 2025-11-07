# ESPE-AWD27819-ODII
# TravelBrain

**TravelBrain** is a web-based application that automatically generates personalized travel itineraries based on weather, budget, and distance.  
The system integrates multiple APIs to provide real-time data for travel planning, including route estimation, weather forecasts, currency conversion, and destination imagery.

The main objective of this project is to demonstrate:
- Integration of multiple external APIs  
- Implementation of CRUD operations  
- Development of a user-centered travel planning system  

---

## Features

- **Search and explore destinations**  
- **Calculate routes and estimated travel time**  
- **Retrieve current and forecasted weather conditions**  
- **Display currency exchange rates**  
- **Generate automated travel itineraries**  
- **Save favorite routes and trips (CRUD)**  
- **Share or download itinerary summaries as PDF files**  
- **Display destination images**  
- **Integrate interactive maps for route visualization**

---

## APIs and External Services

- **OpenWeather API** – Provides current weather and forecast data  
- **Mapbox** – Used for distance calculation, routing, and map rendering  
- **Currency Exchange API** – Retrieves up-to-date currency exchange rates  
- **Unsplash API** – Supplies high-quality images of destinations

---

## CRUD Operations

The application implements basic CRUD functionality for managing travel itineraries:

- **Create** – Add new travel plans, destinations and favorite routes  
- **Read** – View saved itineraries and favorite routes  
- **Update** – Modify trip details (e.g., destination, budget, dates). Favorite routes: rename coming soon  
- **Delete** – Remove itineraries and favorite routes from storage

---

## Environment Variables

Set these in `config/env.php` or your server environment:

- `MONGO_URI` – MongoDB connection string (e.g., mongodb://localhost:27017)
- `MONGO_DB` – Database name (default: travel_brain)
- `MAPBOX_TOKEN` – Public Mapbox token (used by `/config.js` for the client)
- `OPENWEATHER_API_KEY` – OpenWeather key for weather feature

---

## API Endpoints (selection)

All JSON responses include appropriate HTTP status codes; authenticated endpoints require a logged-in session (cookies).

Favorite Routes
- `GET /api/routes/favorites?page=1&size=20` – List the current user’s favorite routes
- `POST /api/routes/favorites` – Save a new favorite route
	- Body
		- `name` (string, optional) – Display name/alias
		- `origin` { `lat` number, `lon` number, `label` string }
		- `destination` { `lat` number, `lon` number, `label` string }
		- `distanceKm` (number, >= 0)
		- `durationSec` (number, optional, >= 0)
		- `mode` (string, optional: driving|walking|cycling|fallback)
	- Response: `{ ok: true, id: "..." }`
- `DELETE /api/routes/favorites/{id}` – Delete a favorite route owned by the current user

Trips
- `GET /api/trips` – List user trips
- `POST /api/trips` – Create a trip
- `DELETE /api/trips/{id}` – Delete a trip

Weather
- `GET /api/weather/current?lat={lat}&lon={lon}&log=1` – Current weather and logs the query
- `GET /api/weather/history?page=1&size=20` – Weather search history for user

---

## Routes Feature – Alignment with Design

High-level mapping to the UML provided in the attachments:

- Use cases: “Calculate Route” (guest) and “Save Favorite Routes” (registered) are supported. Mapbox is the external Map API.
- `FavoriteRoute` persistence is implemented as a MongoDB document with these fields: `userId`, `name` (alias), `origin{lat,lon,label}`, `destination{lat,lon,label}`, `distanceKm`, `durationSec?`, `mode?`, `createdAt`.
	- This embeds a light snapshot instead of referencing `Route`/`Destination` entities directly, which fits our document DB and keeps retrieval simple for the UI.
- API follows REST conventions with pagination and ownership checks (401/404/400 responses as applicable).

Differences from UML (and planned refinements):
- UML shows `FavoriteRoute` referencing a `Route` entity and including `alias`; we store a flattened snapshot and use `name` for the alias.
- UML uses `durationMin`; we persist `durationSec` for precision and compute minutes in the UI.
- A future enhancement may add `PUT /api/routes/favorites/{id}` to rename an entry and `GET /api/routes/favorites/{id}` to fetch a single favorite.

---

## Quick Start: Favorite Routes (UI)

1) Open “Rutas” page, type an origin and destination, and click “Calcular”.
2) When the route is shown, click “Guardar favorito” (requires sign-in). Name is optional.
3) Your favorites appear in the right panel; use “Load” to fill inputs and recalculate, or “Delete” to remove.

---

## Project Goals

- Demonstrate API integration and asynchronous data handling  
- Apply RESTful design principles  
- Implement dynamic and responsive front-end components  
- Provide a smooth and interactive user experience  

---

## Future Improvements

- Add authentication and user profiles  
- Enable collaborative itinerary planning  
- Integrate AI-based travel recommendations  
- Include support for multi-language interfaces  
  
Additional items planned for Routes:
- Optional server proxy for Mapbox calls with API usage logging and rate limits
- Rename favorite route (PUT) and fetch-by-id endpoints
