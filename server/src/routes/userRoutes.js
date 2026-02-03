const express = require('express');
const {
  getProfile,
  updateProfile,
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory,
  getStats,
  resetStats,
  getPreferences,
  updatePreferences,
  getWorkflows
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Processing history
router.get('/history', getHistory);
router.get('/history/:id', getHistoryItem);
router.delete('/history/:id', deleteHistoryItem);
router.delete('/history', clearHistory);

// Statistics
router.get('/stats', getStats);
router.post('/reset-stats', resetStats);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Saved workflows
router.get('/workflows', getWorkflows);

module.exports = router;