const PDFService = require('../services/pdfService');
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
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload at least 2 PDF files'
      });
    }

    const startTime = Date.now();
    
    // Process files
    const result = await PDFService.mergePDFs(req.files, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('merge', 'multiple_files', result.size, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'merge',
      originalFiles: req.files.map(file => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      })),
      resultFile: {
        name: path.basename(result.path),
        size: result.size,
        path: result.path
      },
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed'
    });

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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const startTime = Date.now();
    const file = req.files[0];
    
    // Process file
    const result = await PDFService.splitPDF(file, req.body);
    
    // Update user usage
    let totalSize = 0;
    if (result.files) {
      totalSize = result.files.reduce((sum, f) => sum + f.size, 0);
    }
    req.user.incrementUsage(totalSize);
    req.user.addProcessingHistory('split', file.originalname, totalSize, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'split',
      originalFiles: [{
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }],
      resultFile: result.files ? {
        name: 'split_files',
        size: totalSize
      } : null,
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed',
      batchId: result.isZip ? `split_${Date.now()}` : null,
      batchTotal: result.files ? result.files.length : 1
    });

    if (result.isZip) {
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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const startTime = Date.now();
    const file = req.files[0];
    
    // Process file
    const result = await PDFService.compressPDF(file, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('compress', file.originalname, result.size, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'compress',
      originalFiles: [{
        name: file.originalname,
        size: result.originalSize,
        type: file.mimetype
      }],
      resultFile: {
        name: `compressed_${Date.now()}.pdf`,
        size: result.size,
        path: result.path
      },
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed',
      compressionRatio: result.compressionRatio
    });

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
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload at least 1 PDF file'
      });
    }

    const startTime = Date.now();
    const pdfFile = req.files.find(f => f.mimetype === 'application/pdf');
    const imageFile = req.files.find(f => f.mimetype.startsWith('image/'));
    
    if (!pdfFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }

    // Process file
    const result = await PDFService.addWatermark(pdfFile, {
      ...req.body,
      image: imageFile
    });
    
    // Update user usage
    req.user.incrementUsage(result.size);
    req.user.addProcessingHistory('watermark', pdfFile.originalname, result.size, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'watermark',
      originalFiles: [{
        name: pdfFile.originalname,
        size: pdfFile.size,
        type: pdfFile.mimetype
      }],
      resultFile: {
        name: `watermarked_${Date.now()}.pdf`,
        size: result.size,
        path: result.path
      },
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed'
    });

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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const startTime = Date.now();
    const file = req.files[0];
    
    // Process file
    const result = await PDFService.performOCR(file, req.body);
    
    // Update user usage
    req.user.incrementUsage(result.size || 0);
    req.user.addProcessingHistory('ocr', file.originalname, result.size || 0, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'ocr',
      originalFiles: [{
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }],
      resultFile: result.path ? {
        name: `ocr_${Date.now()}.pdf`,
        size: result.size,
        path: result.path
      } : null,
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed',
      ocrAccuracy: result.accuracy,
      featuresUsed: [{ name: 'languages', value: result.language }]
    });

    if (result.path) {
      // Send searchable PDF
      res.setHeader('Content-Disposition', `attachment; filename="ocr_${Date.now()}.pdf"`);
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
    } else {
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
    }
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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const startTime = Date.now();
    const file = req.files[0];
    
    // Process file
    const result = await PDFService.pdfToImages(file, req.body);
    
    // Update user usage
    let totalSize = 0;
    if (result.images) {
      totalSize = result.images.reduce((sum, img) => sum + img.size, 0);
    }
    req.user.incrementUsage(totalSize);
    req.user.addProcessingHistory('pdf-to-image', file.originalname, totalSize, Date.now() - startTime);
    await req.user.save();
    
    // Save processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      operation: 'pdf-to-image',
      originalFiles: [{
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }],
      processingTime: result.processingTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed',
      batchId: result.isZip ? `images_${Date.now()}` : null,
      batchTotal: result.images ? result.images.length : 1
    });

    if (result.isZip) {
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
      res.setHeader('Content-Type', `image/${path.extname(imageResult.name).slice(1)}`);
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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const file = req.files[0];
    const metadata = await PDFService.getPDFMetadata(file.path);
    
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
    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload exactly 1 PDF file'
      });
    }

    const file = req.files[0];
    const validation = await PDFService.validatePDF(file.path);
    
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