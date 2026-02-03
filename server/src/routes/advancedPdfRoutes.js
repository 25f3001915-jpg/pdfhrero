import express from 'express'
import {
    pdfToPowerPoint,
    pdfToExcel,
    htmlToPDF,
    signPDF,
    redactPDF,
    comparePDF,
    repairPDF,
    convertToPDFA,
    stampPDF,
    cropPDF
} from '../controllers/advancedPdfController.js'
import upload, { handleMulterError } from '../middleware/upload.js'
import { protect, checkFileSize } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Advanced PDF conversion
router.post('/to-powerpoint', upload.single('file'), handleMulterError, checkFileSize, pdfToPowerPoint)
router.post('/to-excel', upload.single('file'), handleMulterError, checkFileSize, pdfToExcel)
router.post('/to-pdfa', upload.single('file'), handleMulterError, checkFileSize, convertToPDFA)

// HTML to PDF
router.post('/html-to-pdf', htmlToPDF)

// PDF editing and security
router.post('/sign', upload.single('file'), handleMulterError, checkFileSize, signPDF)
router.post('/redact', upload.single('file'), handleMulterError, checkFileSize, redactPDF)
router.post('/stamp', upload.single('file'), handleMulterError, checkFileSize, stampPDF)
router.post('/crop', upload.single('file'), handleMulterError, checkFileSize, cropPDF)

// PDF comparison and repair
router.post('/compare', upload.array('files', 2), handleMulterError, checkFileSize, comparePDF)
router.post('/repair', upload.single('file'), handleMulterError, checkFileSize, repairPDF)

export default router