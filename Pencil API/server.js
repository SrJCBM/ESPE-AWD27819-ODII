const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const pencilRoutes = require('./routes/pencilRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Pencil API',
        version: '1.0.0',
        endpoints: {
            'GET /api/pencils': 'Get all pencils',
            'GET /api/pencils/:id': 'Get pencil by ID',
            'POST /api/pencils': 'Create new pencil',
            'PUT /api/pencils/:id': 'Update pencil',
            'DELETE /api/pencils/:id': 'Delete pencil',
            'GET /api/pencils/search/:serialNumber': 'Find by serial number',
            'POST /api/pencils/:id/discount': 'Apply discount (business rule)',
            'GET /api/pencils/brand/:brand': 'Get pencils by brand'
        }
    });
});

app.use('/api/pencils', pencilRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/pencils`);
});
