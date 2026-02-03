const express = require('express');
const {
  getPlans,
  createSubscription,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  updatePaymentMethod,
  getBillingHistory,
  stripeWebhook
} = require('../controllers/subscriptionController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', getPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Apply authentication middleware to all other routes
router.use(auth);

// Subscription management
router.get('/', getSubscription);
router.post('/create', createSubscription);
router.post('/cancel', cancelSubscription);
router.post('/resume', resumeSubscription);
router.post('/payment-method', updatePaymentMethod);
router.get('/billing-history', getBillingHistory);

module.exports = router;