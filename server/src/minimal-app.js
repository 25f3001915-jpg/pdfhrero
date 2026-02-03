const express = require('express');
const cors = require('cors');
const path = require('path');
const { compressImage, convertImage, resizeImage, rotateImage, cropImage } = require('./controllers/imageController');

// Initialize app
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Minimal API is running'
  });
});

// Image routes
app.post('/api/image/compress', compressImage);
app.post('/api/image/convert', convertImage);
app.post('/api/image/resize', resizeImage);
app.post('/api/image/rotate', rotateImage);
app.post('/api/image/crop', cropImage);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});

module.exports = app;