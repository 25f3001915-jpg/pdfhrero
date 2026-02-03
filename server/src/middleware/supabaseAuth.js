const jwt = require('jsonwebtoken');
const { UserDB } = require('../utils/database');
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

      // Check if user still exists in our profiles table
      const user = await UserDB.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists'
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

    if (!UserDB.hasFeatureAccess(req.user, featureName)) {
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

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    // Handle different file upload structures
    let files = [];
    if (req.files.file) {
      files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    } else {
      // If files are structured differently
      files = Object.values(req.files);
    }

    for (const file of files) {
      const fileSize = file.size || (file.data ? file.data.length : 0);
      if (fileSize > maxSize || !UserDB.canProcessFile(req.user, fileSize)) {
        return res.status(400).json({
          status: 'error',
          message: `File size exceeds limit. Maximum allowed: ${Math.min(maxSize, req.user.features.max_file_size)} bytes`
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

    if (!UserDB.hasQuotaAvailable(req.user)) {
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