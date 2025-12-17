const express = require('express');
const router = express.Router();
const Pencil = require('../models/Pencil');

// HTTP Status Codes - Constantes para evitar números mágicos
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Mensajes de respuesta constantes
const MESSAGES = {
    PENCIL_NOT_FOUND: 'Pencil not found',
    PENCIL_CREATED: 'Pencil created successfully',
    PENCIL_UPDATED: 'Pencil updated successfully',
    PENCIL_DELETED: 'Pencil deleted successfully',
    INVALID_DISCOUNT: 'Please provide a valid discount percentage (0-100)'
};

// POST /api/pencils - Crear nuevo lápiz
router.post('/', async (req, res) => {
    try {
        const pencil = new Pencil(req.body);
        const savedPencil = await pencil.save();
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGES.PENCIL_CREATED,
            data: savedPencil
        });
    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Error creating pencil',
            error: error.message
        });
    }
});

// GET /api/pencils - Obtener todos los lápices
router.get('/', async (req, res) => {
    try {
        const pencils = await Pencil.find();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            count: pencils.length,
            data: pencils
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching pencils',
            error: error.message
        });
    }
});

// PUT /api/pencils/:id - Actualizar lápiz por ID
router.put('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!pencil) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.PENCIL_NOT_FOUND
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.PENCIL_UPDATED,
            data: pencil
        });
    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Error updating pencil',
            error: error.message
        });
    }
});

// DELETE /api/pencils/:id - Eliminar lápiz por ID
router.delete('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findByIdAndDelete(req.params.id);
        if (!pencil) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.PENCIL_NOT_FOUND
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.PENCIL_DELETED,
            data: pencil
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error deleting pencil',
            error: error.message
        });
    }
});

// GET /api/pencils/search/:serialNumber - Buscar por número de serie - Buscar por número de serie
router.get('/search/:serialNumber', async (req, res) => {
    try {
        const pencil = await Pencil.findOne({ serialNumber: req.params.serialNumber });
        if (!pencil) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.PENCIL_NOT_FOUND
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: pencil
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error searching pencil',
            error: error.message
        });
    }
});

// POST /api/pencils/:id/discount - Aplicar descuento (regla de negocio) - Aplicar descuento (regla de negocio)
router.post('/:id/discount', async (req, res) => {
    try {
        const { discountPercentage } = req.body;
        const MIN_DISCOUNT = 0;
        const MAX_DISCOUNT = 100;
        
        const isInvalidDiscount = !discountPercentage || 
                                  discountPercentage < MIN_DISCOUNT || 
                                  discountPercentage > MAX_DISCOUNT;
        
        if (isInvalidDiscount) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MESSAGES.INVALID_DISCOUNT
            });
        }

        const pencil = await Pencil.findById(req.params.id);
        if (!pencil) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.PENCIL_NOT_FOUND
            });
        }

        const originalPrice = pencil.price;
        const discountAmount = calculateDiscount(originalPrice, discountPercentage);
        const newPrice = originalPrice - discountAmount;

        pencil.price = parseFloat(newPrice.toFixed(2));
        pencil.isNew = false;
        await pencil.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Discount of ${discountPercentage}% applied successfully`,
            data: {
                originalPrice,
                discountPercentage,
                discountAmount: parseFloat(discountAmount.toFixed(2)),
                newPrice: pencil.price,
                pencil
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error applying discount',
            error: error.message
        });
    }
});

// GET /api/pencils/brand/:brand - Obtener lápices por marca
router.get('/brand/:brand', async (req, res) => {
    try {
        const pencils = await Pencil.find({ 
            brand: { $regex: req.params.brand, $options: 'i' } 
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            count: pencils.length,
            data: pencils
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching pencils by brand',
            error: error.message
        });
    }
});

// GET /api/pencils/:id - Obtener lápiz por ID
router.get('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findById(req.params.id);
        if (!pencil) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.PENCIL_NOT_FOUND
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: pencil
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching pencil',
            error: error.message
        });
    }
});

/**
 * Calcula el monto de descuento basado en el precio y porcentaje
 * @param {number} price - Precio original
 * @param {number} percentage - Porcentaje de descuento
 * @returns {number} - Monto del descuento
 */
function calculateDiscount(price, percentage) {
    return (price * percentage) / 100;
}

module.exports = router;
