const express = require('express');
const router = express.Router();
const Pencil = require('../models/Pencil');



// POST /api/pencils
router.post('/', async (req, res) => {
    try {
        const pencil = new Pencil(req.body);
        const savedPencil = await pencil.save();
        res.status(201).json({
            success: true,
            message: 'Pencil created successfully',
            data: savedPencil
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating pencil',
            error: error.message
        });
    }
});

// GET /api/pencils
router.get('/', async (req, res) => {
    try {
        const pencils = await Pencil.find();
        res.status(200).json({
            success: true,
            count: pencils.length,
            data: pencils
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pencils',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!pencil) {
            return res.status(404).json({
                success: false,
                message: 'Pencil not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Pencil updated successfully',
            data: pencil
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating pencil',
            error: error.message
        });
    }
});

// DELETE /api/pencils/:id
router.delete('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findByIdAndDelete(req.params.id);
        if (!pencil) {
            return res.status(404).json({
                success: false,
                message: 'Pencil not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Pencil deleted successfully',
            data: pencil
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting pencil',
            error: error.message
        });
    }
});


// GET /api/pencils/search/:serialNumber
router.get('/search/:serialNumber', async (req, res) => {
    try {
        const pencil = await Pencil.findOne({ serialNumber: req.params.serialNumber });
        if (!pencil) {
            return res.status(404).json({
                success: false,
                message: 'Pencil not found'
            });
        }
        res.status(200).json({
            success: true,
            data: pencil
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching pencil',
            error: error.message
        });
    }
});


// POST /api/pencils/:id/discount
router.post('/:id/discount', async (req, res) => {
    try {
        const { discountPercentage } = req.body;
        
        if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid discount percentage (0-100)'
            });
        }

        const pencil = await Pencil.findById(req.params.id);
        if (!pencil) {
            return res.status(404).json({
                success: false,
                message: 'Pencil not found'
            });
        }

        const originalPrice = pencil.price;
        const discountAmount = (originalPrice * discountPercentage) / 100;
        const newPrice = originalPrice - discountAmount;

        pencil.price = parseFloat(newPrice.toFixed(2));
        pencil.isNew = false; 
        await pencil.save();

        res.status(200).json({
            success: true,
            message: `Discount of ${discountPercentage}% applied successfully`,
            data: {
                originalPrice: originalPrice,
                discountPercentage: discountPercentage,
                discountAmount: parseFloat(discountAmount.toFixed(2)),
                newPrice: pencil.price,
                pencil: pencil
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error applying discount',
            error: error.message
        });
    }
});

// GET /api/pencils/brand/:brand
router.get('/brand/:brand', async (req, res) => {
    try {
        const pencils = await Pencil.find({ 
            brand: { $regex: req.params.brand, $options: 'i' } 
        });
        res.status(200).json({
            success: true,
            count: pencils.length,
            data: pencils
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pencils by brand',
            error: error.message
        });
    }
});

// GET /api/pencils/:id
router.get('/:id', async (req, res) => {
    try {
        const pencil = await Pencil.findById(req.params.id);
        if (!pencil) {
            return res.status(404).json({
                success: false,
                message: 'Pencil not found'
            });
        }
        res.status(200).json({
            success: true,
            data: pencil
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pencil',
            error: error.message
        });
    }
});

module.exports = router;
