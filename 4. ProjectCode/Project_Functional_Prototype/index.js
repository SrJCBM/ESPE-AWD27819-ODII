// Cargar variables de entorno
require('dotenv').config();

const port = process.env.PORT || 3004;
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

// Configure mongoose
mongoose.set('strictQuery', false);

// Configurar CORS para permitir peticiones desde PHP (puerto 8000)
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3004', 'https://travelbrain-3tfv.onrender.com'],
  credentials: true
}));

// Middleware ANTES de conectar a la BD
app.use(express.json());

// Servir archivos estáticos desde /public
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Rutas para servir vistas HTML
app.get('/auth/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'auth', 'login.html'));
});

app.get('/auth/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'auth', 'register.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'home', 'index.html'));
});

// Rutas de API ANTES de conectar a la BD
const weatherRoutes = require("./routes/weatherRoutes");
const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/", weatherRoutes);
app.use("/", userRoutes);
app.use("/", tripRoutes);
app.use("/", authRoutes);

// Connect to MongoDB with proper options
mongoose.connect(`mongodb+srv://SrJCBM:bdd2025@cluster0.tjvfmrk.mongodb.net/travel_brain?retryWrites=true&w=majority`, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log("System connected to MongoDb Database");
    // Start server only after DB connection is established
    app.listen(port, '0.0.0.0', () => console.log("TravelBrain Server is running on port -->" + port));
})
.catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB error:", error));
db.on("disconnected", () => console.log("MongoDB disconnected"));