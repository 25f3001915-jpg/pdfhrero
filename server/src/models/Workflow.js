const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: [true, 'Operation is required'],
    enum: [
      'merge', 'split', 'compress', 'rotate', 'watermark',
      'protect', 'unlock', 'image-to-pdf', 'pdf-to-image',
      'word-to-pdf', 'pdf-to-word', 'organize', 'page-numbers',
      'ocr', 'to-powerpoint', 'to-excel', 'to-pdfa', 'sign',
      'redact', 'compare', 'repair', 'stamp', 'crop', 'html-to-pdf'
    ]
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  order: {
    type: Number,
    required: true
  }
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Workflow name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [workflowStepSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  averageProcessingTime: {
    type: Number,
    default: 0 // in milliseconds
  },
  successRate: {
    type: Number,
    default: 100 // percentage
  },
  category: {
    type: String,
    enum: [
      'organize', 'optimize', 'convert-to', 'convert-from', 
      'edit', 'security', 'batch', 'custom'
    ],
    default: 'custom'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Processing configuration
  maxConcurrentJobs: {
    type: Number,
    default: 1
  },
  timeout: {
    type: Number,
    default: 300000 // 5 minutes in milliseconds
  },
  // Error handling
  retryAttempts: {
    type: Number,
    default: 3
  },
  onError: {
    type: String,
    enum: ['stop', 'continue', 'retry'],
    default: 'retry'
  },
  // Notifications
  notifyOnCompletion: {
    type: Boolean,
    default: false
  },
  notifyOnFailure: {
    type: Boolean,
    default: true
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
workflowSchema.index({ userId: 1, createdAt: -1 });
workflowSchema.index({ isPublic: 1, usageCount: -1 });
workflowSchema.index({ category: 1 });
workflowSchema.index({ tags: 1 });

// Pre-save middleware to update timestamps
workflowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for step count
workflowSchema.virtual('stepCount').get(function() {
  return this.steps.length;
});

// Virtual for estimated processing time
workflowSchema.virtual('estimatedTime').get(function() {
  // Base time per operation (in milliseconds)
  const operationTimes = {
    merge: 2000,
    split: 1500,
    compress: 3000,
    rotate: 1000,
    watermark: 1500,
    protect: 1000,
    unlock: 800,
    'image-to-pdf': 2500,
    'pdf-to-image': 2000,
    'word-to-pdf': 3500,
    'pdf-to-word': 4000,
    organize: 1500,
    'page-numbers': 1200,
    ocr: 5000,
    'to-powerpoint': 4500,
    'to-excel': 4000,
    'to-pdfa': 2500,
    sign: 1800,
    redact: 3000,
    compare: 2500,
    repair: 3500,
    stamp: 1200,
    crop: 1000,
    'html-to-pdf': 3000
  };

  let totalTime = 0;
  this.steps.forEach(step => {
    totalTime += operationTimes[step.operation] || 2000;
  });

  return totalTime * (this.maxConcurrentJobs || 1);
});

// Instance methods
workflowSchema.methods.execute = async function(files, userId) {
  // This would be implemented in the workflow service
  // For now, return a placeholder
  return {
    workflowId: this._id,
    userId,
    status: 'processing',
    estimatedTime: this.estimatedTime
  };
};

workflowSchema.methods.validateSteps = function() {
  if (!this.steps || this.steps.length === 0) {
    throw new Error('Workflow must have at least one step');
  }

  // Validate step order
  const stepNumbers = this.steps.map(step => step.order).sort((a, b) => a - b);
  for (let i = 0; i < stepNumbers.length; i++) {
    if (stepNumbers[i] !== i + 1) {
      throw new Error('Step order must be sequential starting from 1');
    }
  }

  return true;
};

workflowSchema.methods.incrementUsage = function(processingTime, success = true) {
  this.usageCount += 1;
  this.lastUsed = new Date();
  
  if (success) {
    const totalTime = this.averageProcessingTime * (this.usageCount - 1) + processingTime;
    this.averageProcessingTime = totalTime / this.usageCount;
  } else {
    this.successRate = ((this.successRate / 100) * (this.usageCount - 1)) / this.usageCount * 100;
  }
};

// Static methods
workflowSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

workflowSchema.statics.findPublic = function(limit = 20) {
  return this.find({ isPublic: true })
    .sort({ usageCount: -1, createdAt: -1 })
    .limit(limit);
};

workflowSchema.statics.findByCategory = function(category, userId = null) {
  const query = { category };
  if (userId) {
    query.$or = [
      { userId },
      { isPublic: true }
    ];
  }
  return this.find(query).sort({ usageCount: -1 });
};

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow;