// Mock MongoDB for testing without local installation
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Mock routes for testing
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'PDFMasterPro API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide name, email and password'
    });
  }
  
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully (mock)',
    user: { id: 'mock-user-id', name, email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Login successful (mock)',
    token: 'mock-jwt-token',
    user: { id: 'mock-user-id', email }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com',
        subscription: { tier: 'free', status: 'active' }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server!`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚠️  Note: Running in mock mode (no database connection)`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
});

module.exports = { app };