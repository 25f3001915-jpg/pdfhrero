const mongoose = require('mongoose');

const processingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  operation: {
    type: String,
    required: [true, 'Operation is required'],
    enum: [
      'merge', 'split', 'compress', 'rotate', 'watermark',
      'protect', 'unlock', 'image-to-pdf', 'pdf-to-image',
      'word-to-pdf', 'pdf-to-word', 'organize', 'page-numbers',
      'ocr', 'to-powerpoint', 'to-excel', 'to-pdfa', 'sign',
      'redact', 'compare', 'repair', 'stamp', 'crop', 'html-to-pdf',
      'batch-process', 'workflow-execute'
    ]
  },
  // File information
  originalFiles: [{
    name: String,
    size: Number, // in bytes
    type: String
  }],
  resultFile: {
    name: String,
    size: Number, // in bytes
    path: String
  },
  // Processing details
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  // Resource usage
  memoryUsed: {
    type: Number // in MB
  },
  cpuTime: {
    type: Number // in milliseconds
  },
  // Status and results
  status: {
    type: String,
    enum: ['completed', 'failed', 'processing', 'cancelled'],
    default: 'completed'
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  // Quality metrics
  compressionRatio: {
    type: Number // for compression operations
  },
  ocrAccuracy: {
    type: Number // for OCR operations (0-100)
  },
  // Metadata
  clientIp: String,
  userAgent: String,
  sessionId: String,
  // Batch processing
  batchId: {
    type: String
  },
  batchTotal: {
    type: Number
  },
  batchIndex: {
    type: Number
  },
  // Performance metrics
  queueTime: {
    type: Number // time spent in queue (milliseconds)
  },
  processingSpeed: {
    type: Number // pages/second or MB/second
  },
  // Cost tracking (for billing)
  cost: {
    type: Number, // in cents or smallest currency unit
    default: 0
  },
  // Feature usage
  featuresUsed: [{
    name: String,
    value: mongoose.Schema.Types.Mixed
  }],
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
processingHistorySchema.index({ userId: 1, createdAt: -1 });
processingHistorySchema.index({ operation: 1, createdAt: -1 });
processingHistorySchema.index({ status: 1, createdAt: -1 });
processingHistorySchema.index({ workflowId: 1 });
processingHistorySchema.index({ batchId: 1 });
processingHistorySchema.index({ createdAt: -1 });

// Virtual for processing duration
processingHistorySchema.virtual('duration').get(function() {
  return this.endTime.getTime() - this.startTime.getTime();
});

// Virtual for file count
processingHistorySchema.virtual('fileCount').get(function() {
  return this.originalFiles ? this.originalFiles.length : 0;
});

// Virtual for total input size
processingHistorySchema.virtual('totalInputSize').get(function() {
  if (!this.originalFiles) return 0;
  return this.originalFiles.reduce((total, file) => total + (file.size || 0), 0);
});

// Virtual for size reduction (for compression)
processingHistorySchema.virtual('sizeReduction').get(function() {
  if (!this.originalFiles || !this.resultFile || this.originalFiles.length === 0) return 0;
  const totalInput = this.totalInputSize;
  const output = this.resultFile.size || 0;
  return totalInput > 0 ? ((totalInput - output) / totalInput) * 100 : 0;
});

// Instance methods
processingHistorySchema.methods.getPerformanceMetrics = function() {
  return {
    duration: this.duration,
    processingSpeed: this.processingSpeed,
    memoryUsed: this.memoryUsed,
    cpuTime: this.cpuTime,
    queueTime: this.queueTime,
    sizeReduction: this.sizeReduction
  };
};

processingHistorySchema.methods.isBatchOperation = function() {
  return this.batchId !== undefined && this.batchTotal > 1;
};

processingHistorySchema.methods.isPartOfBatch = function() {
  return this.batchId !== undefined;
};

// Static methods
processingHistorySchema.statics.findByUser = function(userId, limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

processingHistorySchema.statics.findByOperation = function(operation, userId = null, limit = 50) {
  const query = { operation };
  if (userId) query.userId = userId;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

processingHistorySchema.statics.findFailed = function(userId = null, limit = 50) {
  const query = { status: 'failed' };
  if (userId) query.userId = userId;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

processingHistorySchema.statics.getStats = function(userId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchQuery = { createdAt: { $gte: startDate } };
  if (userId) matchQuery.userId = userId;
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$operation',
        count: { $sum: 1 },
        totalProcessingTime: { $sum: '$processingTime' },
        averageProcessingTime: { $avg: '$processingTime' },
        totalInputSize: { $sum: '$totalInputSize' },
        totalOutputSize: { $sum: { $ifNull: ['$resultFile.size', 0] } },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        operation: '$_id',
        count: 1,
        totalProcessingTime: 1,
        averageProcessingTime: 1,
        totalInputSize: 1,
        totalOutputSize: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successCount', '$count'] },
            100
          ]
        },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

processingHistorySchema.statics.getDailyStats = function(userId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchQuery = { 
    createdAt: { $gte: startDate },
    status: 'completed'
  };
  if (userId) matchQuery.userId = userId;
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalProcessingTime: { $sum: '$processingTime' },
        averageProcessingTime: { $avg: '$processingTime' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        totalProcessingTime: 1,
        averageProcessingTime: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);
};

processingHistorySchema.statics.cleanupOldRecords = function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

const ProcessingHistory = mongoose.model('ProcessingHistory', processingHistorySchema);

module.exports = ProcessingHistory;