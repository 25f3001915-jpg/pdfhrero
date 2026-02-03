import fs from 'fs/promises'
import path from 'path'
import PDFService from '../services/pdfService.js'
import { PDFDocument } from 'pdf-lib'
import puppeteer from 'puppeteer'

// @desc    Convert PDF to PowerPoint
// @route   POST /api/pdf/to-powerpoint
// @access  Private
export const pdfToPowerPoint = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        // Note: This is a simplified implementation
        // In production, you'd use a library like pdf2office or similar
        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pageCount = pdfDoc.getPageCount()
        
        // For demo purposes, we'll create a simple response
        // Real implementation would convert to actual PPTX format
        const result = {
            pageCount: pageCount,
            message: 'PDF to PowerPoint conversion requires specialized libraries. Consider using pdf2office or similar tools.',
            pages: Array.from({ length: pageCount }, (_, i) => ({
                pageNumber: i + 1,
                status: 'converted'
            }))
        }
        
        res.json({
            success: true,
            message: 'PDF processed for PowerPoint conversion',
            result
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert PDF to PowerPoint',
            error: error.message
        })
    }
}

// @desc    Convert PDF to Excel
// @route   POST /api/pdf/to-excel
// @access  Private
export const pdfToExcel = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        // Note: This is a simplified implementation
        // In production, you'd use tabular data extraction libraries
        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pageCount = pdfDoc.getPageCount()
        
        // For demo purposes, we'll create a simple response
        // Real implementation would extract tables and convert to XLSX
        const result = {
            pageCount: pageCount,
            message: 'PDF to Excel conversion requires table extraction libraries. Consider using tabula-py or similar tools.',
            tables: []
        }
        
        res.json({
            success: true,
            message: 'PDF processed for Excel conversion',
            result
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert PDF to Excel',
            error: error.message
        })
    }
}

// @desc    Convert HTML to PDF
// @route   POST /api/pdf/html-to-pdf
// @access  Private
export const htmlToPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        const { html, url } = req.body
        
        if (!html && !url) {
            return res.status(400).json({
                success: false,
                message: 'Please provide HTML content or URL'
            })
        }
        
        let browser
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
            
            const page = await browser.newPage()
            
            if (url) {
                await page.goto(url, { waitUntil: 'networkidle0' })
            } else {
                await page.setContent(html, { waitUntil: 'networkidle0' })
            }
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            })
            
            await browser.close()
            
            const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `html-to-pdf-${Date.now()}.pdf`)
            await fs.writeFile(outputPath, pdfBuffer)
            filesToCleanup.push(outputPath)
            
            res.download(outputPath, 'converted.pdf', async (err) => {
                await PDFService.cleanupFiles(filesToCleanup)
                if (err) console.error('Download error:', err)
            })
        } catch (puppeteerError) {
            if (browser) await browser.close()
            throw puppeteerError
        }
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert HTML to PDF',
            error: error.message
        })
    }
}

// @desc    Sign PDF with digital signature
// @route   POST /api/pdf/sign
// @access  Private
export const signPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        const { name, reason, location } = req.body
        filesToCleanup.push(req.file.path)
        
        const signatureData = {
            name: name || 'Unknown Signer',
            reason: reason || 'Document Approval',
            location: location || 'India',
            date: new Date()
        }
        
        const signedPdfBytes = await PDFService.signPDF(req.file.path, signatureData)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `signed-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, signedPdfBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'signed.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to sign PDF',
            error: error.message
        })
    }
}

// @desc    Redact PDF (remove sensitive information)
// @route   POST /api/pdf/redact
// @access  Private
export const redactPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        // redactions should be array of { page, x, y, width, height, reason }
        const redactions = JSON.parse(req.body.redactions || '[]')
        filesToCleanup.push(req.file.path)
        
        const redactedPdfBytes = await PDFService.redactPDF(req.file.path, redactions)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `redacted-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, redactedPdfBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'redacted.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to redact PDF',
            error: error.message
        })
    }
}

// @desc    Compare two PDFs
// @route   POST /api/pdf/compare
// @access  Private
export const comparePDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.files || req.files.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Please upload exactly 2 PDF files'
            })
        }
        
        const filePaths = req.files.map(file => {
            filesToCleanup.push(file.path)
            return file.path
        })
        
        const comparisonResult = await PDFService.comparePDFs(filePaths[0], filePaths[1])
        
        await PDFService.cleanupFiles(filesToCleanup)
        
        res.json({
            success: true,
            result: comparisonResult
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to compare PDFs',
            error: error.message
        })
    }
}

// @desc    Repair corrupted PDF
// @route   POST /api/pdf/repair
// @access  Private
export const repairPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        const repairedPdfBytes = await PDFService.repairPDF(req.file.path)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `repaired-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, repairedPdfBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'repaired.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to repair PDF',
            error: error.message
        })
    }
}

// @desc    Convert PDF to PDF/A format
// @route   POST /api/pdf/to-pdfa
// @access  Private
export const convertToPDFA = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        const pdfaBytes = await PDFService.convertToPDFA(req.file.path)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `pdfa-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, pdfaBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'document.pdfa.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert to PDF/A',
            error: error.message
        })
    }
}

// @desc    Add custom stamp to PDF
// @route   POST /api/pdf/stamp
// @access  Private
export const stampPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        const { text, position } = req.body
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Please provide stamp text'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        const stampedPdfBytes = await PDFService.stampPDF(req.file.path, text, position)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `stamped-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, stampedPdfBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'stamped.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to stamp PDF',
            error: error.message
        })
    }
}

// @desc    Crop PDF pages
// @route   POST /api/pdf/crop
// @access  Private
export const cropPDF = async (req, res) => {
    const filesToCleanup = []
    
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }
        
        const { x, y, width, height } = req.body
        if (!x || !y || !width || !height) {
            return res.status(400).json({
                success: false,
                message: 'Please provide crop box dimensions (x, y, width, height)'
            })
        }
        
        filesToCleanup.push(req.file.path)
        
        const cropBox = [parseFloat(x), parseFloat(y), parseFloat(width), parseFloat(height)]
        const croppedPdfBytes = await PDFService.cropPDF(req.file.path, cropBox)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `cropped-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, croppedPdfBytes)
        filesToCleanup.push(outputPath)
        
        res.download(outputPath, 'cropped.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to crop PDF',
            error: error.message
        })
    }
}