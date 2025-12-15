const mongoose = require('mongoose');

const pencilSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true
    },
    material: {
        type: String,
        required: [true, 'Material is required'],
        trim: true,
        enum: ['Wood', 'Plastic', 'Recycled', 'Metal', 'Other']
    },
    isNew: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pencil', pencilSchema);
