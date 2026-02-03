const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ProcessingHistory = require('../models/ProcessingHistory');
const Workflow = require('../models/Workflow');
const logger = require('../utils/logger');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Subscription statistics
    const subscriptionStats = await Subscription.getStats();
    const activeSubscriptions = await Subscription.countDocuments({ 
      status: 'active',
      currentPeriodEnd: { $gt: new Date() }
    });

    // Processing statistics
    const totalProcessing = await ProcessingHistory.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const processingByOperation = await ProcessingHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$operation',
          count: { $sum: 1 },
          totalTime: { $sum: '$processingTime' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Revenue statistics
    const revenueStats = await Subscription.aggregate([
      {
        $unwind: '$billingHistory'
      },
      {
        $match: {
          'billingHistory.date': { $gte: startDate },
          'billingHistory.status': 'succeeded'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$billingHistory.amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const transactionCount = revenueStats.length > 0 ? revenueStats[0].transactionCount : 0;

    // System statistics
    const avgProcessingTime = await ProcessingHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          averageTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const successRate = await ProcessingHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          growth: userGrowth
        },
        subscriptions: {
          active: activeSubscriptions,
          byTier: subscriptionStats
        },
        processing: {
          total: totalProcessing,
          byOperation: processingByOperation,
          averageTime: avgProcessingTime.length > 0 ? avgProcessingTime[0].averageTime : 0,
          successRate: successRate.length > 0 ? 
            (successRate[0].successful / successRate[0].total) * 100 : 0
        },
        revenue: {
          total: totalRevenue,
          transactions: transactionCount,
          averageTransaction: transactionCount > 0 ? totalRevenue / transactionCount : 0
        }
      }
    });
  } catch (err) {
    logger.error('Admin dashboard stats error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const tier = req.query.tier;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tier) {
      query['subscription.tier'] = tier;
    }

    const users = await User.find(query)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          subscription: user.subscription,
          usage: user.usage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          processingHistoryCount: user.processingHistory.length
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
    logger.error('Get users error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires')
      .populate('savedWorkflows');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's recent processing history
    const recentHistory = await ProcessingHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's subscription info
    const subscription = await Subscription.findOne({ userId: user._id });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          subscription: user.subscription,
          features: user.features,
          usage: user.usage,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
          googleId: user.googleId
        },
        subscription: subscription ? {
          id: subscription._id,
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          limits: subscription.limits,
          usage: subscription.usage
        } : null,
        recentHistory: recentHistory.map(item => ({
          id: item._id,
          operation: item.operation,
          processingTime: item.processingTime,
          status: item.status,
          createdAt: item.createdAt
        }))
      }
    });
  } catch (err) {
    logger.error('Get user error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update user subscription
// @route   PUT /api/admin/users/:id/subscription
// @access  Private (Admin only)
exports.updateUserSubscription = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { tier, status, currentPeriodEnd } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user subscription
    if (tier) user.subscription.tier = tier;
    if (status) user.subscription.status = status;
    if (currentPeriodEnd) user.subscription.currentPeriodEnd = new Date(currentPeriodEnd);
    
    await user.save();

    // Update or create subscription record
    let subscription = await Subscription.findOne({ userId: user._id });
    
    if (subscription) {
      if (tier) subscription.tier = tier;
      if (status) subscription.status = status;
      if (currentPeriodEnd) subscription.currentPeriodEnd = new Date(currentPeriodEnd);
      await subscription.save();
    } else if (tier || status) {
      // Create new subscription record
      subscription = await Subscription.create({
        userId: user._id,
        tier: tier || user.subscription.tier,
        status: status || user.subscription.status,
        stripeCustomerId: user.subscription.stripeCustomerId || 'admin_' + user._id,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User subscription updated successfully',
      data: {
        user: {
          id: user._id,
          subscription: user.subscription
        }
      }
    });
  } catch (err) {
    logger.error('Update user subscription error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
exports.getLogs = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    // In a real implementation, you would read from your log files
    // This is a placeholder response
    
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'System operational',
        service: 'pdfmasterpro-api'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        logs
      }
    });
  } catch (err) {
    logger.error('Get logs error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    System maintenance
// @route   POST /api/admin/maintenance
// @access  Private (Admin only)
exports.systemMaintenance = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.subscription.tier !== 'enterprise') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { action } = req.body;
    
    switch (action) {
      case 'cleanup-temp-files':
        // Clean up temporary files
        // Implementation would depend on your temp file storage
        break;
        
      case 'cleanup-old-history':
        // Clean up old processing history
        await ProcessingHistory.cleanupOldRecords(90);
        break;
        
      case 'cleanup-inactive-users':
        // Clean up inactive user accounts
        // Implementation would depend on your policy
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid maintenance action'
        });
    }

    res.status(200).json({
      status: 'success',
      message: `Maintenance action '${action}' completed successfully`
    });
  } catch (err) {
    logger.error('System maintenance error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};