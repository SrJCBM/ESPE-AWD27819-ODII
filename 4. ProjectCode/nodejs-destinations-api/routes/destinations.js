const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const Destination = require('../models/Destination');
const { ObjectId } = require('mongodb');

/**
 * GET /api/destinations
 * Obtiene todos los destinos con paginación
 * Query params: page, size, search
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('destinations');
    
    // Paginación
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 20;
    const skip = (page - 1) * size;
    
    // Búsqueda opcional
    const search = req.query.search;
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    // Obtener documentos
    const docs = await collection
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(size)
      .toArray();
    
    // Convertir a modelos
    const destinations = docs.map(doc => Destination.fromDocument(doc).toJSON());
    
    // Contar total
    const total = await collection.countDocuments(query);
    
    res.json({
      ok: true,
      items: destinations,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size)
    });
  } catch (error) {
    console.error('Error en GET /api/destinations:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener destinos',
      message: error.message
    });
  }
});

/**
 * GET /api/destinations/:id
 * Obtiene un destino por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('destinations');
    
    // Validar ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        ok: false,
        error: 'ID inválido'
      });
    }
    
    const doc = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!doc) {
      return res.status(404).json({
        ok: false,
        error: 'Destino no encontrado'
      });
    }
    
    const destination = Destination.fromDocument(doc);
    
    res.json({
      ok: true,
      destination: destination.toJSON()
    });
  } catch (error) {
    console.error('Error en GET /api/destinations/:id:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener destino',
      message: error.message
    });
  }
});

/**
 * POST /api/destinations
 * Crea un nuevo destino (o retorna existente si ya existe)
 * Body: { name, country, description, lat, lng, img }
 */
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('destinations');
    
    // Crear modelo
    const destination = new Destination({
      name: req.body.name,
      country: req.body.country,
      description: req.body.description,
      lat: req.body.lat ? parseFloat(req.body.lat) : null,
      lng: req.body.lng ? parseFloat(req.body.lng) : null,
      img: req.body.img,
      userId: null, // Destinos compartidos
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Validar
    const errors = destination.validate();
    if (errors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Datos inválidos',
        errors
      });
    }
    
    // 🔑 BUSCAR SI YA EXISTE (mismo nombre y país)
    const existing = await collection.findOne({
      name: { $regex: `^${destination.name}$`, $options: 'i' },
      country: { $regex: `^${destination.country}$`, $options: 'i' }
    });
    
    if (existing) {
      // ✅ Ya existe, retornar el ID existente
      console.log(`✨ Destino existente encontrado: ${existing._id}`);
      return res.status(200).json({
        ok: true,
        message: 'Destino ya existe',
        id: existing._id.toString(),
        destination: Destination.fromDocument(existing).toJSON(),
        isNew: false
      });
    }
    
    // ✅ No existe, crear uno nuevo
    const doc = destination.toDocument();
    const result = await collection.insertOne(doc);
    
    console.log(`✨ Nuevo destino creado: ${result.insertedId}`);
    
    res.status(201).json({
      ok: true,
      message: 'Destino creado exitosamente',
      id: result.insertedId.toString(),
      destination: {
        ...destination.toJSON(),
        _id: result.insertedId.toString()
      },
      isNew: true
    });
  } catch (error) {
    console.error('Error en POST /api/destinations:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al crear destino',
      message: error.message
    });
  }
});

/**
 * PUT /api/destinations/:id
 * Actualiza un destino existente
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('destinations');
    
    // Validar ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        ok: false,
        error: 'ID inválido'
      });
    }
    
    // Preparar datos de actualización
    const updateData = {
      updatedAt: new Date()
    };
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.country) updateData.country = req.body.country;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.lat !== undefined) updateData.lat = req.body.lat ? parseFloat(req.body.lat) : null;
    if (req.body.lng !== undefined) updateData.lng = req.body.lng ? parseFloat(req.body.lng) : null;
    if (req.body.img !== undefined) updateData.img = req.body.img;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Destino no encontrado'
      });
    }
    
    res.json({
      ok: true,
      message: 'Destino actualizado exitosamente',
      modified: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Error en PUT /api/destinations/:id:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al actualizar destino',
      message: error.message
    });
  }
});

/**
 * DELETE /api/destinations/:id
 * Elimina un destino
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('destinations');
    
    // Validar ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        ok: false,
        error: 'ID inválido'
      });
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Destino no encontrado'
      });
    }
    
    res.json({
      ok: true,
      message: 'Destino eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE /api/destinations/:id:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al eliminar destino',
      message: error.message
    });
  }
});

module.exports = router;
