require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect, close } = require('./config/db');
const destinationsRouter = require('./routes/destinations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'Node.js Destinations API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Rutas
app.use('/api/destinations', destinationsRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Ruta no encontrada',
    path: req.url
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
async function start() {
  try {
    // Conectar a MongoDB
    await connect();
    
    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor Node.js corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api/destinations`);
      console.log(`🔍 Health check: http://localhost:${PORT}/\n`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await close();
  process.exit(0);
});

// Iniciar aplicación
start();

module.exports = app;
