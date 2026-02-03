const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  tier: {
    type: String,
    enum: ['free', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial', 'past_due'],
    default: 'active'
  },
  // Stripe integration
  stripeCustomerId: {
    type: String,
    required: [true, 'Stripe customer ID is required']
  },
  stripeSubscriptionId: {
    type: String
  },
  stripePriceId: {
    type: String
  },
  // Billing information
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  // Trial information
  trialStart: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal', 'none'],
    default: 'none'
  },
  lastPayment: {
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending']
    }
  },
  // Usage limits
  limits: {
    monthlyFiles: {
      type: Number,
      default: 100
    },
    maxFileSize: {
      type: Number, // in bytes
      default: 10485760 // 10MB
    },
    concurrentJobs: {
      type: Number,
      default: 1
    },
    storageLimit: {
      type: Number, // in bytes
      default: 1073741824 // 1GB
    }
  },
  // Feature access
  features: {
    batchProcessing: {
      type: Boolean,
      default: false
    },
    customWorkflows: {
      type: Boolean,
      default: false
    },
    priorityProcessing: {
      type: Boolean,
      default: false
    },
    offlineAccess: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    advancedOCR: {
      type: Boolean,
      default: false
    },
    teamCollaboration: {
      type: Boolean,
      default: false
    }
  },
  // Usage tracking
  usage: {
    filesProcessed: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number, // in bytes
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  // Billing history
  billingHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    description: String,
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending', 'refunded']
    },
    invoiceId: String
  }],
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ tier: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Pre-save middleware to update timestamps
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set limits and features based on tier
subscriptionSchema.pre('save', function(next) {
  const tierConfig = {
    free: {
      limits: {
        monthlyFiles: 100,
        maxFileSize: 10485760, // 10MB
        concurrentJobs: 1,
        storageLimit: 1073741824 // 1GB
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
      limits: {
        monthlyFiles: 1000,
        maxFileSize: 52428800, // 50MB
        concurrentJobs: 3,
        storageLimit: 10737418240 // 10GB
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
      limits: {
        monthlyFiles: 5000,
        maxFileSize: 104857600, // 100MB
        concurrentJobs: 5,
        storageLimit: 107374182400 // 100GB
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
      limits: {
        monthlyFiles: Infinity,
        maxFileSize: 524288000, // 500MB
        concurrentJobs: 10,
        storageLimit: 1099511627776 // 1TB
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

  const config = tierConfig[this.tier] || tierConfig.free;
  this.limits = { ...config.limits };
  this.features = { ...config.features };

  next();
});

// Virtual for days remaining in current period
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.currentPeriodEnd) return 0;
  const today = new Date();
  const remaining = (this.currentPeriodEnd - today) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(remaining));
});

// Virtual for whether subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && 
         (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
});

// Virtual for whether trial is active
subscriptionSchema.virtual('isTrialActive').get(function() {
  if (!this.trialEnd) return false;
  const today = new Date();
  return this.trialEnd > today && this.status === 'trial';
});

// Instance methods
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

subscriptionSchema.methods.canProcessFile = function(fileSize) {
  return fileSize <= this.limits.maxFileSize;
};

subscriptionSchema.methods.hasQuotaAvailable = function() {
  // Reset quota if month has passed
  const now = new Date();
  if (now.getMonth() !== this.usage.lastReset.getMonth() || 
      now.getFullYear() !== this.usage.lastReset.getFullYear()) {
    this.usage.filesProcessed = 0;
    this.usage.apiCalls = 0;
    this.usage.lastReset = now;
  }
  
  return this.usage.filesProcessed < this.limits.monthlyFiles;
};

subscriptionSchema.methods.incrementUsage = function(fileSize = 0, apiCalls = 0) {
  this.usage.filesProcessed += 1;
  this.usage.storageUsed += fileSize;
  this.usage.apiCalls += apiCalls;
};

subscriptionSchema.methods.addBillingRecord = function(amount, description, status = 'succeeded', invoiceId = null) {
  this.billingHistory.push({
    date: new Date(),
    amount,
    description,
    status,
    invoiceId
  });
  
  // Keep only last 50 billing records
  if (this.billingHistory.length > 50) {
    this.billingHistory = this.billingHistory.slice(-50);
  }
};

subscriptionSchema.methods.upgradeTier = function(newTier) {
  this.tier = newTier;
  this.status = 'active';
  // The pre-save middleware will automatically update limits and features
};

subscriptionSchema.methods.cancelSubscription = function() {
  this.status = 'cancelled';
  this.cancelAtPeriodEnd = true;
  this.canceledAt = new Date();
};

// Static methods
subscriptionSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId });
};

subscriptionSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    currentPeriodEnd: { $gt: new Date() }
  });
};

subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: {
      $gte: new Date(),
      $lte: expirationDate
    }
  });
};

subscriptionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$tier',
        count: { $sum: 1 },
        activeCount: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'active'] },
                  { $or: [
                    { $eq: ['$currentPeriodEnd', null] },
                    { $gt: ['$currentPeriodEnd', new Date()] }
                  ]}
                ]
              }, 
              1, 
              0
            ]
          }
        },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'active'] },
              { 
                $multiply: [
                  '$lastPayment.amount',
                  { $cond: [{ $eq: ['$lastPayment.status', 'succeeded'] }, 1, 0] }
                ]
              },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        tier: '$_id',
        count: 1,
        activeCount: 1,
        revenue: 1,
        _id: 0
      }
    }
  ]);
};

subscriptionSchema.statics.cleanupInactive = function(months = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  return this.deleteMany({
    $or: [
      { status: 'cancelled' },
      { status: 'expired' },
      { 
        status: 'active',
        currentPeriodEnd: { $lt: cutoffDate }
      }
    ]
  });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;