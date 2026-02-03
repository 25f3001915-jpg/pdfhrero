const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },

  // Subscription System
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'active'
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    trialEndsAt: {
      type: Date,
      default: null
    }
  },

  // Usage Tracking
  usage: {
    filesProcessed: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0 // in bytes
    },
    monthlyQuota: {
      type: Number,
      default: 100 // Free tier limit
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },

  // Feature Access Control
  features: {
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB for free tier
    },
    concurrentJobs: {
      type: Number,
      default: 1
    },
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
    }
  },

  // Activity Tracking
  processingHistory: [{
    operation: String,
    fileName: String,
    fileSize: Number,
    processingTime: Number, // in milliseconds
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed'
    }
  }],

  // Custom Workflows
  savedWorkflows: [{
    name: String,
    description: String,
    steps: [mongoose.Schema.Types.Mixed],
    isPublic: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // OAuth Integration
  googleId: {
    type: String,
    default: null
  },

  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },

  // Security & Activity
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  activeSessions: {
    type: Number,
    default: 0
  },

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

// Indexes for better performance
userSchema.index({ 'subscription.tier': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  next();
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-find middleware to exclude sensitive fields
userSchema.pre(/^find/, function(next) {
  this.select('-__v -passwordResetToken -passwordResetExpires');
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

userSchema.methods.hasFeatureAccess = function(featureName) {
  return this.features[featureName] === true;
};

userSchema.methods.canProcessFile = function(fileSize) {
  return fileSize <= this.features.maxFileSize;
};

userSchema.methods.hasQuotaAvailable = function() {
  // Reset quota if month has passed
  const now = new Date();
  if (now.getMonth() !== this.usage.lastReset.getMonth() || 
      now.getFullYear() !== this.usage.lastReset.getFullYear()) {
    this.usage.filesProcessed = 0;
    this.usage.lastReset = now;
  }
  
  const quotas = {
    free: 100,
    pro: 1000,
    business: 5000,
    enterprise: Infinity
  };
  
  const currentQuota = quotas[this.subscription.tier] || quotas.free;
  return this.usage.filesProcessed < currentQuota;
};

userSchema.methods.incrementUsage = function(fileSize = 0) {
  this.usage.filesProcessed += 1;
  this.usage.storageUsed += fileSize;
};

userSchema.methods.addProcessingHistory = function(operation, fileName, fileSize, processingTime, status = 'completed') {
  this.processingHistory.push({
    operation,
    fileName,
    fileSize,
    processingTime,
    status,
    timestamp: new Date()
  });
  
  // Keep only last 100 entries
  if (this.processingHistory.length > 100) {
    this.processingHistory = this.processingHistory.slice(-100);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;