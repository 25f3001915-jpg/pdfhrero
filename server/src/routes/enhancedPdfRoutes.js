const express = require('express');
const {
  mergePDFs,
  splitPDF,
  compressPDF,
  addWatermark,
  performOCR,
  pdfToImages,
  getMetadata,
  validatePDF
} = require('../controllers/enhancedPdfController');
const { auth, checkFileSize, checkQuota } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// File size limits (50MB for most operations, 100MB for OCR)
const fileSizeLimit = 50 * 1024 * 1024;
const ocrFileSizeLimit = 100 * 1024 * 1024;

// PDF Operations
router.post('/merge', checkQuota(), mergePDFs);
router.post('/split', checkQuota(), splitPDF);
router.post('/compress', checkQuota(), compressPDF);
router.post('/watermark', checkQuota(), addWatermark);
router.post('/ocr', checkQuota(), performOCR);
router.post('/to-images', checkQuota(), pdfToImages);
router.post('/metadata', getMetadata);
router.post('/validate', validatePDF);

module.exports = router;