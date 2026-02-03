const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected field';
    error = { message, statusCode: 400 };
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    error = { message: err.message, statusCode: 400 };
  }

  if (err.type === 'StripeRateLimitError') {
    error = { message: 'Too many requests made to Stripe', statusCode: 429 };
  }

  if (err.type === 'StripeInvalidRequestError') {
    error = { message: err.message, statusCode: 400 };
  }

  if (err.type === 'StripeAPIError') {
    error = { message: 'Stripe API error', statusCode: 500 };
  }

  if (err.type === 'StripeConnectionError') {
    error = { message: 'Stripe connection error', statusCode: 503 };
  }

  // PDF processing errors
  if (err.name === 'PDFParseError') {
    error = { message: 'Invalid PDF file', statusCode: 400 };
  }

  if (err.name === 'PDFEncryptionError') {
    error = { message: 'Encrypted PDF not supported', statusCode: 400 };
  }

  if (err.name === 'PDFCorruptionError') {
    error = { message: 'Corrupted PDF file', statusCode: 400 };
  }

  // Image processing errors
  if (err.name === 'ImageProcessingError') {
    error = { message: 'Image processing failed', statusCode: 400 };
  }

  // OCR errors
  if (err.name === 'OCRError') {
    error = { message: 'OCR processing failed', statusCode: 400 };
  }

  // Default error
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;