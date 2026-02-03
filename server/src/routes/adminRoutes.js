const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserSubscription,
  getLogs,
  systemMaintenance
} = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/subscription', updateUserSubscription);

// System management
router.get('/logs', getLogs);
router.post('/maintenance', systemMaintenance);

module.exports = router;