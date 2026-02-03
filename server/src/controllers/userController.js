const User = require('../models/User');
const ProcessingHistory = require('../models/ProcessingHistory');
const logger = require('../utils/logger');

// @desc    Get user profile and statistics
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires');

    // Get user statistics
    const stats = await ProcessingHistory.getStats(req.user.id, 30);
    const dailyStats = await ProcessingHistory.getDailyStats(req.user.id, 30);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          subscription: user.subscription,
          features: user.features,
          usage: user.usage,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount
        },
        statistics: {
          recentOperations: stats,
          dailyActivity: dailyStats,
          totalFilesProcessed: user.usage.filesProcessed,
          storageUsed: user.usage.storageUsed,
          hasQuotaAvailable: user.hasQuotaAvailable()
        }
      }
    });
  } catch (err) {
    logger.error('Get profile error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    
    // Handle avatar upload
    if (req.files && req.files.avatar) {
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll just store the filename
      fieldsToUpdate.avatar = req.files.avatar[0].filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -verificationToken -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          subscription: user.subscription
        }
      }
    });
  } catch (err) {
    logger.error('Update profile error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get processing history
// @route   GET /api/user/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const operation = req.query.operation;
    const status = req.query.status;

    let query = { userId: req.user.id };
    
    if (operation) query.operation = operation;
    if (status) query.status = status;

    const history = await ProcessingHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await ProcessingHistory.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        history: history.map(item => ({
          id: item._id,
          operation: item.operation,
          originalFiles: item.originalFiles,
          resultFile: item.resultFile,
          processingTime: item.processingTime,
          status: item.status,
          error: item.error,
          createdAt: item.createdAt,
          isBatchOperation: item.isBatchOperation(),
          sizeReduction: item.sizeReduction
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    logger.error('Get history error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get specific history item
// @route   GET /api/user/history/:id
// @access  Private
exports.getHistoryItem = async (req, res, next) => {
  try {
    const historyItem = await ProcessingHistory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!historyItem) {
      return res.status(404).json({
        status: 'error',
        message: 'History item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        historyItem: {
          id: historyItem._id,
          operation: historyItem.operation,
          originalFiles: historyItem.originalFiles,
          resultFile: historyItem.resultFile,
          processingTime: historyItem.processingTime,
          startTime: historyItem.startTime,
          endTime: historyItem.endTime,
          status: historyItem.status,
          error: historyItem.error,
          performanceMetrics: historyItem.getPerformanceMetrics(),
          createdAt: historyItem.createdAt
        }
      }
    });
  } catch (err) {
    logger.error('Get history item error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Delete history item
// @route   DELETE /api/user/history/:id
// @access  Private
exports.deleteHistoryItem = async (req, res, next) => {
  try {
    const historyItem = await ProcessingHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!historyItem) {
      return res.status(404).json({
        status: 'error',
        message: 'History item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'History item deleted successfully'
    });
  } catch (err) {
    logger.error('Delete history item error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Clear all history
// @route   DELETE /api/user/history
// @access  Private
exports.clearHistory = async (req, res, next) => {
  try {
    const result = await ProcessingHistory.deleteMany({
      userId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: `Deleted ${result.deletedCount} history items`
    });
  } catch (err) {
    logger.error('Clear history error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Get processing statistics
    const operationStats = await ProcessingHistory.getStats(req.user.id, days);
    const dailyStats = await ProcessingHistory.getDailyStats(req.user.id, days);
    
    // Get file type statistics
    const fileTypeStats = await ProcessingHistory.aggregate([
      { $match: { userId: req.user.id } },
      { $unwind: '$originalFiles' },
      {
        $group: {
          _id: '$originalFiles.type',
          count: { $sum: 1 },
          totalSize: { $sum: '$originalFiles.size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get success rate
    const totalOperations = await ProcessingHistory.countDocuments({ userId: req.user.id });
    const successfulOperations = await ProcessingHistory.countDocuments({ 
      userId: req.user.id, 
      status: 'completed' 
    });
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalOperations,
          successfulOperations,
          successRate: successRate.toFixed(2),
          totalFilesProcessed: req.user.usage.filesProcessed,
          storageUsed: req.user.usage.storageUsed,
          quotaRemaining: Math.max(0, req.user.features.monthlyFiles - req.user.usage.filesProcessed)
        },
        operations: operationStats,
        dailyActivity: dailyStats,
        fileTypes: fileTypeStats.map(stat => ({
          type: stat._id,
          count: stat.count,
          totalSize: stat.totalSize
        }))
      }
    });
  } catch (err) {
    logger.error('Get stats error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Reset usage statistics
// @route   POST /api/user/reset-stats
// @access  Private
exports.resetStats = async (req, res, next) => {
  try {
    // Reset user usage
    req.user.usage.filesProcessed = 0;
    req.user.usage.storageUsed = 0;
    req.user.usage.lastReset = new Date();
    await req.user.save();

    res.status(200).json({
      status: 'success',
      message: 'Usage statistics reset successfully'
    });
  } catch (err) {
    logger.error('Reset stats error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get user preferences
// @route   GET /api/user/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    // This would return user preferences like:
    // - Default output format
    // - Notification preferences
    // - UI preferences
    // - Saved settings
    
    const preferences = {
      defaultOutputFormat: 'pdf',
      notifications: {
        email: true,
        processingComplete: true,
        quotaWarning: true
      },
      ui: {
        theme: 'light',
        language: 'en'
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        preferences
      }
    });
  } catch (err) {
    logger.error('Get preferences error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    // In a real implementation, you would:
    // 1. Validate the preferences
    // 2. Update user document or separate preferences collection
    // 3. Return updated preferences
    
    const preferences = req.body;
    
    // For now, just return the updated preferences
    res.status(200).json({
      status: 'success',
      data: {
        preferences
      }
    });
  } catch (err) {
    logger.error('Update preferences error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get user's saved workflows
// @route   GET /api/user/workflows
// @access  Private
exports.getWorkflows = async (req, res, next) => {
  try {
    // This would fetch workflows saved by the user
    // Implementation would depend on your workflow system
    
    res.status(200).json({
      status: 'success',
      data: {
        workflows: []
      }
    });
  } catch (err) {
    logger.error('Get workflows error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};