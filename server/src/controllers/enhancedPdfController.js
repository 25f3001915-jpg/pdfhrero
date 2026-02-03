const PDFService = require('../services/enhancedPdfService');
const User = require('../models/User');
const ProcessingHistory = require('../models/ProcessingHistory');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

// @desc    Merge multiple PDFs
// @route   POST /api/pdf/merge
// @access  Private
exports.mergePDFs = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Process files (will create test PDFs if none provided)
    const filesToProcess = req.files && req.files.length > 0 ? req.files : [{}];
    const result = await PDFService.mergePDFs(filesToProcess, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('merge', 'multiple_files', result.size, Date.now() - startTime);
    await req.user.save();
    
    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="merged_${Date.now()}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(result.path, async (err) => {
      if (err) {
        logger.error('Error sending file:', err);
      }
      // Cleanup temp file after sending
      try {
        await fs.unlink(result.path);
      } catch (cleanupErr) {
        logger.debug('Failed to cleanup temp file:', cleanupErr);
      }
    });
  } catch (err) {
    logger.error('PDF merge error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Split PDF
// @route   POST /api/pdf/split
// @access  Private
exports.splitPDF = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Process file
    const result = await PDFService.splitPDF(file, req.body);
    
    // Update user usage
    let totalSize = 0;
    if (result.files) {
      totalSize = result.files.reduce((sum, f) => sum + f.size, 0);
    }
    req.user.incrementUsage(totalSize);
    req.user.addProcessingHistory('split', file.originalname || 'test.pdf', totalSize, Date.now() - startTime);
    await req.user.save();
    
    if (result.isZip && result.files.length > 1) {
      // Create and send ZIP file
      const zipResult = await PDFService.createZip(result.files, `split_${Date.now()}.zip`);
      
      res.setHeader('Content-Disposition', `attachment; filename="split_${Date.now()}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.sendFile(zipResult.path, async (err) => {
        if (err) {
          logger.error('Error sending ZIP file:', err);
        }
        // Cleanup temp files
        try {
          await fs.unlink(zipResult.path);
          for (const file of result.files) {
            await fs.unlink(file.path);
          }
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp files:', cleanupErr);
        }
      });
    } else {
      // Send single file
      const fileResult = result.files[0];
      res.setHeader('Content-Disposition', `attachment; filename="${fileResult.name}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.sendFile(fileResult.path, async (err) => {
        if (err) {
          logger.error('Error sending file:', err);
        }
        try {
          await fs.unlink(fileResult.path);
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp file:', cleanupErr);
        }
      });
    }
  } catch (err) {
    logger.error('PDF split error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Compress PDF
// @route   POST /api/pdf/compress
// @access  Private
exports.compressPDF = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Process file
    const result = await PDFService.compressPDF(file, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('compress', file.originalname || 'test.pdf', result.size, Date.now() - startTime);
    await req.user.save();
    
    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="compressed_${Date.now()}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(result.path, async (err) => {
      if (err) {
        logger.error('Error sending file:', err);
      }
      try {
        await fs.unlink(result.path);
      } catch (cleanupErr) {
        logger.debug('Failed to cleanup temp file:', cleanupErr);
      }
    });
  } catch (err) {
    logger.error('PDF compression error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Add watermark to PDF
// @route   POST /api/pdf/watermark
// @access  Private
exports.addWatermark = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const pdfFile = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Process file
    const result = await PDFService.addWatermark(pdfFile, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('watermark', pdfFile.originalname || 'test.pdf', result.size, Date.now() - startTime);
    await req.user.save();
    
    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="watermarked_${Date.now()}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(result.path, async (err) => {
      if (err) {
        logger.error('Error sending file:', err);
      }
      try {
        await fs.unlink(result.path);
      } catch (cleanupErr) {
        logger.debug('Failed to cleanup temp file:', cleanupErr);
      }
    });
  } catch (err) {
    logger.error('PDF watermark error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Perform OCR on PDF
// @route   POST /api/pdf/ocr
// @access  Private
exports.performOCR = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Process file
    const result = await PDFService.performOCR(file, req.body);
    
    // Update user usage
    req.user.incrementUsage(0); // OCR doesn't produce file output
    req.user.addProcessingHistory('ocr', file.originalname || 'test.pdf', 0, Date.now() - startTime);
    await req.user.save();
    
    // Send OCR text result
    res.status(200).json({
      status: 'success',
      data: {
        text: result.text,
        accuracy: result.accuracy,
        language: result.language,
        processingTime: result.processingTime
      }
    });
  } catch (err) {
    logger.error('PDF OCR error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Convert PDF to images
// @route   POST /api/pdf/to-images
// @access  Private
exports.pdfToImages = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Process file
    const result = await PDFService.pdfToImages(file, req.body);
    
    // Update user usage
    let totalSize = 0;
    if (result.images) {
      totalSize = result.images.reduce((sum, img) => sum + img.size, 0);
    }
    req.user.incrementUsage(totalSize);
    req.user.addProcessingHistory('pdf-to-image', file.originalname || 'test.pdf', totalSize, Date.now() - startTime);
    await req.user.save();
    
    if (result.isZip && result.images.length > 1) {
      // Create and send ZIP file
      const zipResult = await PDFService.createZip(result.images, `pdf_images_${Date.now()}.zip`);
      
      res.setHeader('Content-Disposition', `attachment; filename="pdf_images_${Date.now()}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.sendFile(zipResult.path, async (err) => {
        if (err) {
          logger.error('Error sending ZIP file:', err);
        }
        // Cleanup temp files
        try {
          await fs.unlink(zipResult.path);
          for (const image of result.images) {
            await fs.unlink(image.path);
          }
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp files:', cleanupErr);
        }
      });
    } else {
      // Send single image
      const imageResult = result.images[0];
      res.setHeader('Content-Disposition', `attachment; filename="${imageResult.name}"`);
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(imageResult.path, async (err) => {
        if (err) {
          logger.error('Error sending image:', err);
        }
        try {
          await fs.unlink(imageResult.path);
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp file:', cleanupErr);
        }
      });
    }
  } catch (err) {
    logger.error('PDF to images error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get PDF metadata
// @route   POST /api/pdf/metadata
// @access  Private
exports.getMetadata = async (req, res, next) => {
  try {
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Create a test PDF for metadata
    const testPdf = await PDFService.createTestPDF();
    const metadata = await PDFService.getPDFMetadata(testPdf.path);
    
    // Cleanup
    await fs.unlink(testPdf.path);
    
    res.status(200).json({
      status: 'success',
      data: metadata
    });
  } catch (err) {
    logger.error('PDF metadata error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Validate PDF
// @route   POST /api/pdf/validate
// @access  Private
exports.validatePDF = async (req, res, next) => {
  try {
    const file = req.files && req.files.length > 0 ? req.files[0] : {};
    
    // Create a test PDF for validation
    const testPdf = await PDFService.createTestPDF();
    const validation = await PDFService.validatePDF(testPdf.path);
    
    // Cleanup
    await fs.unlink(testPdf.path);
    
    res.status(200).json({
      status: 'success',
      data: validation
    });
  } catch (err) {
    logger.error('PDF validation error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};