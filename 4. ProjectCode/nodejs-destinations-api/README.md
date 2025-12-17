# Node.js Destinations API

API REST en Node.js + Express + MongoDB para gestión de destinos turísticos.

## 🚀 Características

- ✅ **Destinos compartidos**: Detecta duplicados por nombre y país
- ✅ **CRUD completo**: Create, Read, Update, Delete
- ✅ **Paginación y búsqueda**
- ✅ **Compatible con AWS Lambda**
- ✅ **Misma base de datos MongoDB que la app PHP**

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu MONGO_URI

# 3. Iniciar servidor
npm start

# O para desarrollo con auto-reload:
npm run dev
```

## 🔌 Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Health Check
```http
GET /
```

**Respuesta:**
```json
{
  "ok": true,
  "service": "Node.js Destinations API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### 2. Obtener todos los destinos
```http
GET /api/destinations?page=1&size=20&search=quito
```

**Query Params:**
- `page` (opcional): Número de página (default: 1)
- `size` (opcional): Tamaño de página (default: 20)
- `search` (opcional): Búsqueda por nombre o país

**Respuesta:**
```json
{
  "ok": true,
  "items": [
    {
      "_id": "69365802e484e2bff100c233",
      "name": "Quito Centro Histórico",
      "country": "Ecuador",
      "description": "Centro colonial de Quito",
      "lat": -0.2201,
      "lng": -78.5123,
      "img": "https://...",
      "userId": null,
      "createdAt": "2024-12-08T10:30:00.000Z",
      "updatedAt": "2024-12-08T10:30:00.000Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 6,
  "totalPages": 1
}
```

---

### 3. Obtener un destino por ID
```http
GET /api/destinations/:id
```

**Ejemplo:**
```http
GET /api/destinations/69365802e484e2bff100c233
```

**Respuesta:**
```json
{
  "ok": true,
  "destination": {
    "_id": "69365802e484e2bff100c233",
    "name": "Quito Centro Histórico",
    "country": "Ecuador",
    "description": "Centro colonial de Quito",
    "lat": -0.2201,
    "lng": -78.5123,
    "img": null,
    "userId": null,
    "createdAt": "2024-12-08T10:30:00.000Z",
    "updatedAt": "2024-12-08T10:30:00.000Z"
  }
}
```

---

### 4. Crear nuevo destino (o retornar existente)
```http
POST /api/destinations
Content-Type: application/json

{
  "name": "Galápagos",
  "country": "Ecuador",
  "description": "Islas volcánicas",
  "lat": -0.9538,
  "lng": -90.9656,
  "img": "https://..."
}
```

**Respuesta (nuevo destino):**
```json
{
  "ok": true,
  "message": "Destino creado exitosamente",
  "id": "675abc123def456789012345",
  "destination": { ... },
  "isNew": true
}
```

**Respuesta (destino existente):**
```json
{
  "ok": true,
  "message": "Destino ya existe",
  "id": "69365802e484e2bff100c233",
  "destination": { ... },
  "isNew": false
}
```

**⚠️ Importante:** Si ya existe un destino con el mismo nombre y país (case-insensitive), retorna el ID existente en lugar de crear uno duplicado.

---

### 5. Actualizar destino
```http
PUT /api/destinations/:id
Content-Type: application/json

{
  "description": "Nueva descripción actualizada",
  "img": "https://nueva-imagen.jpg"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Destino actualizado exitosamente",
  "modified": true
}
```

---

### 6. Eliminar destino
```http
DELETE /api/destinations/:id
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Destino eliminado exitosamente"
}
```

---

## 🧪 Pruebas

```bash
# Ejecutar script de prueba automático
npm test
```

O con curl:

```bash
# GET todos los destinos
curl http://localhost:3000/api/destinations

# POST nuevo destino
curl -X POST http://localhost:3000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Galápagos",
    "country": "Ecuador",
    "description": "Islas volcánicas",
    "lat": -0.9538,
    "lng": -90.9656
  }'

# GET destino por ID
curl http://localhost:3000/api/destinations/675abc123def456789012345
```

---

## 🌐 Deployment en AWS

### AWS Lambda + API Gateway

1. **Instalar Serverless Framework:**
```bash
npm install -g serverless
```

2. **Crear `serverless.yml`:**
```yaml
service: destinations-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    MONGO_URI: ${env:MONGO_URI}
    MONGO_DB: travel_brain

functions:
  api:
    handler: lambda.handler
    events:
      - httpApi: '*'
```

3. **Crear `lambda.js`:**
```javascript
const serverless = require('serverless-http');
const app = require('./server');

module.exports.handler = serverless(app);
```

4. **Deploy:**
```bash
serverless deploy
```

---

## 📁 Estructura del proyecto

```
nodejs-destinations-api/
├── config/
│   └── db.js              # Conexión MongoDB
├── models/
│   └── Destination.js     # Modelo de destino
├── routes/
│   └── destinations.js    # Rutas de la API
├── server.js              # Servidor Express
├── test.js                # Script de pruebas
├── package.json
├── .env.example
└── README.md
```

---

## 🔧 Variables de entorno

```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/travel_brain
MONGO_DB=travel_brain
PORT=3000
NODE_ENV=production
```

---

## 🤝 Integración con la app PHP

Esta API Node.js se conecta a la **misma base de datos MongoDB** que tu aplicación PHP, por lo que:

- ✅ Los destinos creados desde Node.js se ven en PHP
- ✅ Los destinos creados desde PHP se ven en Node.js
- ✅ Ambos sistemas detectan duplicados correctamente
- ✅ Los ratings funcionan con destinos de ambos sistemas

---

## 📝 Notas

- Los destinos se crean con `userId: null` (compartidos)
- La búsqueda es case-insensitive
- La validación se hace en el modelo
- Compatible con MongoDB Atlas

---

## 🐛 Troubleshooting

**Error: MONGO_URI no está definido**
- Verifica que el archivo `.env` existe y tiene `MONGO_URI`

**Error: Connection refused**
- Verifica que MongoDB Atlas permite tu IP
- Verifica que las credenciales son correctas

**Puerto en uso**
- Cambia `PORT` en `.env` o usa: `PORT=4000 npm start`
