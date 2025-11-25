const express = require("express");
const router = express.Router();
const Weather = require("../models/weather");

// 1. GET /weathers (Listar)
router.get("/", async (req, res) => {
    const data = await Weather.find();
    res.json(data);
});

// 2. POST /weathers (Crear)
router.post("/", async (req, res) => {
    const newWeather = new Weather(req.body);
    const saved = await newWeather.save();
    res.status(201).json(saved);
});

// 3. GET /weathers/:id (Buscar)
router.get("/:id", async (req, res) => {
    const w = await Weather.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Weather no encontrado" });
    res.json(w);
});

// 4. PUT /weathers/:id (Actualizar)
router.put("/:id", async (req, res) => {
    const updated = await Weather.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(updated);
});

// 5. DELETE /weathers/:id (Eliminar)
router.delete("/:id", async (req, res) => {
    await Weather.findByIdAndDelete(req.params.id);
    res.json({ message: "Weather eliminado" });
});

module.exports = router;
