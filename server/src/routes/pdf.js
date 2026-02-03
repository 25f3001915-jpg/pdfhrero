import express from 'express'
import {
    mergePDF,
    splitPDF,
    compressPDF,
    rotatePDF,
    watermarkPDF,
    protectPDF,
    unlockPDF,
    imageToPDF,
    pdfToImage,
    wordToPDF,
    pdfToWord,
    organizePDF,
    addPageNumbers,
    ocrImage
} from '../controllers/pdfController.js'
import upload, { handleMulterError } from '../middleware/upload.js'

const router = express.Router()

// Organize
router.post('/merge', upload.array('files', 10), handleMulterError, mergePDF)
router.post('/split', upload.single('file'), handleMulterError, splitPDF)
router.post('/organize', upload.single('file'), handleMulterError, organizePDF)

// Optimize
router.post('/compress', upload.single('file'), handleMulterError, compressPDF)

// Edit
router.post('/rotate', upload.single('file'), handleMulterError, rotatePDF)
router.post('/watermark', upload.single('file'), handleMulterError, watermarkPDF)
router.post('/page-numbers', upload.single('file'), handleMulterError, addPageNumbers)

// Security
router.post('/protect', upload.single('file'), handleMulterError, protectPDF)
router.post('/unlock', upload.single('file'), handleMulterError, unlockPDF)

// Convert
router.post('/image-to-pdf', upload.array('files', 20), handleMulterError, imageToPDF)
router.post('/pdf-to-image', upload.single('file'), handleMulterError, pdfToImage)
router.post('/word-to-pdf', upload.single('file'), handleMulterError, wordToPDF)
router.post('/pdf-to-word', upload.single('file'), handleMulterError, pdfToWord)

// OCR
router.post('/ocr', upload.single('file'), handleMulterError, ocrImage)

export default router
