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
- **Save favorite trips using CRUD operations**  
- **Share or download itinerary summaries as PDF files**  
- **Display destination images**  
- **Integrate interactive maps for route visualization**

---

## APIs and External Services

- **OpenWeather API** – Provides current weather and forecast data  
- **Google Maps API** or **Mapbox** – Used for distance calculation, routing, and map rendering  
- **Currency Exchange API** – Retrieves up-to-date currency exchange rates. El servicio se
  consulta por defecto contra [Frankfurter](https://www.frankfurter.app/), el cual no requiere
  clave de acceso para peticiones básicas.
- **Unsplash API** – Supplies high-quality images of destinations

### ¿Cómo probar la API de divisas?

Puedes verificar que la integración funciona realizando una solicitud directa a Frankfurter
con `curl` u otra herramienta HTTP:

```bash
curl "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP"
