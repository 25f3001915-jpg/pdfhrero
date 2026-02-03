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
} = require('../controllers/pdfController');
const { auth, checkFileSize, checkQuota } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// File size limits (50MB for most operations, 100MB for OCR)
const fileSizeLimit = 50 * 1024 * 1024;
const ocrFileSizeLimit = 100 * 1024 * 1024;

// PDF Operations
router.post('/merge', checkFileSize(fileSizeLimit), checkQuota(), mergePDFs);
router.post('/split', checkFileSize(fileSizeLimit), checkQuota(), splitPDF);
router.post('/compress', checkFileSize(fileSizeLimit), checkQuota(), compressPDF);
router.post('/watermark', checkFileSize(fileSizeLimit), checkQuota(), addWatermark);
router.post('/ocr', checkFileSize(ocrFileSizeLimit), checkQuota(), performOCR);
router.post('/to-images', checkFileSize(fileSizeLimit), checkQuota(), pdfToImages);
router.post('/metadata', checkFileSize(fileSizeLimit), getMetadata);
router.post('/validate', checkFileSize(fileSizeLimit), validatePDF);

module.exports = router;