const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get subscription plans
// @route   GET /api/subscription/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
  try {
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        period: 'forever',
        limits: {
          monthlyFiles: 100,
          maxFileSize: '10MB',
          concurrentJobs: 1,
          storageLimit: '1GB'
        },
        features: {
          batchProcessing: false,
          customWorkflows: false,
          priorityProcessing: false,
          offlineAccess: false,
          apiAccess: false,
          advancedOCR: false,
          teamCollaboration: false
        }
      },
      pro: {
        name: 'Pro',
        price: 999, // ₹999 per month
        period: 'month',
        limits: {
          monthlyFiles: 1000,
          maxFileSize: '50MB',
          concurrentJobs: 3,
          storageLimit: '10GB'
        },
        features: {
          batchProcessing: true,
          customWorkflows: true,
          priorityProcessing: false,
          offlineAccess: false,
          apiAccess: false,
          advancedOCR: false,
          teamCollaboration: false
        }
      },
      business: {
        name: 'Business',
        price: 2999, // ₹2999 per month
        period: 'month',
        limits: {
          monthlyFiles: 5000,
          maxFileSize: '100MB',
          concurrentJobs: 5,
          storageLimit: '100GB'
        },
        features: {
          batchProcessing: true,
          customWorkflows: true,
          priorityProcessing: true,
          offlineAccess: true,
          apiAccess: true,
          advancedOCR: true,
          teamCollaboration: true
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: 9999, // ₹9999 per month
        period: 'month',
        limits: {
          monthlyFiles: 'Unlimited',
          maxFileSize: '500MB',
          concurrentJobs: 10,
          storageLimit: '1TB'
        },
        features: {
          batchProcessing: true,
          customWorkflows: true,
          priorityProcessing: true,
          offlineAccess: true,
          apiAccess: true,
          advancedOCR: true,
          teamCollaboration: true
        }
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });
  } catch (err) {
    logger.error('Get plans error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Create subscription
// @route   POST /api/subscription/create
// @access  Private
exports.createSubscription = async (req, res, next) => {
  try {
    const { plan, paymentMethodId } = req.body;
    
    // Validate plan
    const validPlans = ['pro', 'business', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid plan selected'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({ 
      userId: req.user.id,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have an active subscription'
      });
    }

    // Get or create Stripe customer
    let stripeCustomer;
    
    if (req.user.subscription.stripeCustomerId) {
      try {
        stripeCustomer = await stripe.customers.retrieve(req.user.subscription.stripeCustomerId);
      } catch (err) {
        // Customer doesn't exist, create new one
        stripeCustomer = null;
      }
    }

    if (!stripeCustomer) {
      stripeCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name
      });
      
      // Update user with Stripe customer ID
      req.user.subscription.stripeCustomerId = stripeCustomer.id;
      await req.user.save();
    }

    // Create Stripe subscription
    const priceId = process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}`];
    if (!priceId) {
      return res.status(500).json({
        status: 'error',
        message: 'Plan configuration error'
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    // Create local subscription record
    const newSubscription = await Subscription.create({
      userId: req.user.id,
      tier: plan,
      status: subscription.status,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      paymentMethod: 'card'
    });

    // Update user subscription
    req.user.subscription.tier = plan;
    req.user.subscription.status = subscription.status;
    req.user.subscription.stripeSubscriptionId = subscription.id;
    req.user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await req.user.save();

    res.status(200).json({
      status: 'success',
      data: {
        subscription: {
          id: newSubscription._id,
          tier: newSubscription.tier,
          status: newSubscription.status,
          currentPeriodEnd: newSubscription.currentPeriodEnd,
          clientSecret: subscription.latest_invoice.payment_intent.client_secret
        }
      }
    });
  } catch (err) {
    logger.error('Create subscription error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get current subscription
// @route   GET /api/subscription
// @access  Private
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          subscription: null
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscription: {
          id: subscription._id,
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          daysRemaining: subscription.daysRemaining,
          isActive: subscription.isActive,
          limits: subscription.limits,
          features: subscription.features,
          usage: subscription.usage
        }
      }
    });
  } catch (err) {
    logger.error('Get subscription error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No active subscription found'
      });
    }

    // Cancel at Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update local subscription
    subscription.cancelAtPeriodEnd = true;
    subscription.status = 'cancelled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Update user
    req.user.subscription.status = 'cancelled';
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.'
    });
  } catch (err) {
    logger.error('Cancel subscription error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Resume subscription
// @route   POST /api/subscription/resume
// @access  Private
exports.resumeSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id,
      cancelAtPeriodEnd: true
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No subscription found that can be resumed'
      });
    }

    // Resume at Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
    }

    // Update local subscription
    subscription.cancelAtPeriodEnd = false;
    subscription.status = 'active';
    subscription.canceledAt = null;
    await subscription.save();

    // Update user
    req.user.subscription.status = 'active';
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Subscription resumed successfully'
    });
  } catch (err) {
    logger.error('Resume subscription error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update payment method
// @route   POST /api/subscription/payment-method
// @access  Private
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.body;
    
    const subscription = await Subscription.findOne({ 
      userId: req.user.id,
      status: 'active'
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({
        status: 'error',
        message: 'No active subscription found'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId
    });

    // Set as default
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment method updated successfully'
    });
  } catch (err) {
    logger.error('Update payment method error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get billing history
// @route   GET /api/subscription/billing-history
// @access  Private
exports.getBillingHistory = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.status(200).json({
        status: 'success',
        data: {
          billingHistory: []
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        billingHistory: subscription.billingHistory || []
      }
    });
  } catch (err) {
    logger.error('Get billing history error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/subscription/webhook
// @access  Public
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        // Handle subscription created
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Helper functions for webhook handling
async function handleSubscriptionUpdated(subscription) {
  try {
    const localSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (localSubscription) {
      localSubscription.status = subscription.status;
      localSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      localSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      localSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      await localSubscription.save();
      
      // Update user
      const user = await User.findById(localSubscription.userId);
      if (user) {
        user.subscription.status = subscription.status;
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();
      }
    }
  } catch (err) {
    logger.error('Handle subscription updated error:', err);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const localSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (localSubscription) {
      localSubscription.status = 'cancelled';
      localSubscription.canceledAt = new Date();
      await localSubscription.save();
      
      // Update user
      const user = await User.findById(localSubscription.userId);
      if (user) {
        user.subscription.tier = 'free';
        user.subscription.status = 'cancelled';
        await user.save();
      }
    }
  } catch (err) {
    logger.error('Handle subscription deleted error:', err);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });

    if (subscription) {
      subscription.addBillingRecord(
        invoice.amount_paid,
        `Subscription payment for ${subscription.tier} plan`,
        'succeeded',
        invoice.id
      );
      await subscription.save();
    }
  } catch (err) {
    logger.error('Handle payment succeeded error:', err);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });

    if (subscription) {
      subscription.addBillingRecord(
        invoice.amount_due,
        `Failed payment for ${subscription.tier} plan`,
        'failed',
        invoice.id
      );
      await subscription.save();
    }
  } catch (err) {
    logger.error('Handle payment failed error:', err);
  }
}