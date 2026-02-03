const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id).select('+features +usage');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists'
        });
      }

      // Check if user changed password after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          status: 'error',
          message: 'User recently changed password. Please log in again'
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Authorization middleware for roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.subscription.tier)) {
      return res.status(403).json({
        status: 'error',
        message: 'User role not authorized'
      });
    }

    next();
  };
};

// Feature access middleware
const requireFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    if (!req.user.hasFeatureAccess(featureName)) {
      return res.status(403).json({
        status: 'error',
        message: `Feature '${featureName}' not available in your subscription tier`
      });
    }

    next();
  };
};

// File size check middleware
const checkFileSize = (maxSize) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    const files = Array.isArray(req.files) ? req.files : 
                  req.files.file ? [req.files.file] : 
                  Object.values(req.files).flat();

    for (const file of files) {
      if (file.size > maxSize || !req.user.canProcessFile(file.size)) {
        return res.status(400).json({
          status: 'error',
          message: `File size exceeds limit. Maximum allowed: ${Math.min(maxSize, req.user.features.maxFileSize)} bytes`
        });
      }
    }

    next();
  };
};

// Quota check middleware
const checkQuota = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    if (!req.user.hasQuotaAvailable()) {
      return res.status(429).json({
        status: 'error',
        message: 'Monthly processing quota exceeded. Please upgrade your subscription.'
      });
    }

    next();
  };
};

// Rate limiting per tier
const tierRateLimit = (freeLimit, proLimit, businessLimit, enterpriseLimit) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    const limits = {
      free: freeLimit,
      pro: proLimit,
      business: businessLimit,
      enterprise: enterpriseLimit
    };

    const limit = limits[req.user.subscription.tier] || freeLimit;
    
    // Here you would implement actual rate limiting logic
    // This is a simplified version - in production, use Redis for distributed rate limiting
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();
    
    // Check if user has rate limit info in session or database
    // For now, we'll just pass through
    next();
  };
};

module.exports = {
  auth,
  authorize,
  requireFeature,
  checkFileSize,
  checkQuota,
  tierRateLimit
};