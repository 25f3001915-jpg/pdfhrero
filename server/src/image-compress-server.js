const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const { compressImage } = require('./controllers/imageController');

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

// File upload middleware (simple version)
app.use((req, res, next) => {
  if (req.method === 'POST' && req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    let data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', () => {
      req.rawBody = Buffer.concat(data);
      next();
    });
  } else {
    next();
  }
});

// Test route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Image compression API is running'
  });
});

// Image compression route
app.post('/api/image/compress', compressImage);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Image compression server running on port ${PORT}`);
});

module.exports = app;