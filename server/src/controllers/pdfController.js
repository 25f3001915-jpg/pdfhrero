import fs from 'fs/promises'
import path from 'path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import PDFService from '../services/pdfService.js'

// @desc    Merge multiple PDFs
export const mergePDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least 2 PDF files'
            })
        }

        const filePaths = req.files.map(file => {
            filesToCleanup.push(file.path)
            return file.path
        })

        const mergedPdfBytes = await PDFService.mergePDFs(filePaths)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `merged-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, mergedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'merged.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to merge PDFs',
            error: error.message
        })
    }
}

// @desc    Split PDF
export const splitPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        filesToCleanup.push(req.file.path)
        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pageCount = pdfDoc.getPageCount()

        // For simplicity, split each page into separate PDF
        const splitPdfs = []
        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create()
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
            newPdf.addPage(copiedPage)

            const pdfBytes = await newPdf.save()
            const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `page-${i + 1}-${Date.now()}.pdf`)
            await fs.writeFile(outputPath, pdfBytes)
            splitPdfs.push(outputPath)
            filesToCleanup.push(outputPath)
        }

        // For demo, send first page (in production, create a ZIP file)
        res.download(splitPdfs[0], 'split-page-1.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to split PDF',
            error: error.message
        })
    }
}

// @desc    Compress PDF
export const compressPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        filesToCleanup.push(req.file.path)
        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)

        // Save with compression (pdf-lib automatically compresses)
        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false
        })

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `compressed-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, compressedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'compressed.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to compress PDF',
            error: error.message
        })
    }
}

// @desc    Rotate PDF
export const rotatePDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        const rotation = parseInt(req.body.rotation) || 90
        filesToCleanup.push(req.file.path)

        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = pdfDoc.getPages()

        pages.forEach(page => {
            page.setRotation({ angle: rotation, type: 'degrees' })
        })

        const rotatedPdfBytes = await pdfDoc.save()
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `rotated-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, rotatedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'rotated.pdf', async (err) => {
            await cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to rotate PDF',
            error: error.message
        })
    }
}

// @desc    Add watermark to PDF
export const watermarkPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        const watermarkText = req.body.text || 'WATERMARK'
        const opacity = parseFloat(req.body.opacity) || 0.5

        filesToCleanup.push(req.file.path)
        const pdfBytes = await fs.readFile(req.file.path)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = pdfDoc.getPages()
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        pages.forEach(page => {
            const { width, height } = page.getSize()
            page.drawText(watermarkText, {
                x: width / 2 - 100,
                y: height / 2,
                size: 50,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
                opacity: opacity,
                rotate: { angle: 45, type: 'degrees' }
            })
        })

        const watermarkedPdfBytes = await pdfDoc.save()
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `watermarked-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, watermarkedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'watermarked.pdf', async (err) => {
            await cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to add watermark',
            error: error.message
        })
    }
}

// @desc    Protect PDF with password
export const protectPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        const password = req.body.password
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a password'
            })
        }

        filesToCleanup.push(req.file.path)

        const protectedPdfBytes = await PDFService.protectPDF(req.file.path, password)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `protected-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, protectedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'protected.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to protect PDF',
            error: error.message
        })
    }
}

// @desc    Unlock PDF
export const unlockPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        const password = req.body.password || '' // Password might be empty if not encrypted or user thinks it isn't

        filesToCleanup.push(req.file.path)

        const unlockedPdfBytes = await PDFService.unlockPDF(req.file.path, password)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `unlocked-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, unlockedPdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'unlocked.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to unlock PDF. Incorrect password or file corrupted.',
            error: error.message
        })
    }
}

// @desc    Convert images to PDF
export const imageToPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            })
        }

        const imagePaths = req.files.map(file => {
            filesToCleanup.push(file.path)
            return file.path
        })

        const pdfBytes = await PDFService.imagesToPDF(imagePaths)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `images-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, pdfBytes)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'images.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        console.error('Image to PDF error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to convert images to PDF',
            error: error.message
        })
    }
}

// @desc    Convert PDF to images
export const pdfToImage = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        filesToCleanup.push(req.file.path)

        // Note: Converting PDF to images requires additional libraries like pdf-poppler or pdf2pic
        // For demo purposes, we'll return a placeholder response
        res.status(501).json({
            success: false,
            message: 'PDF to image conversion requires additional setup. Please install pdf-poppler or pdf2pic.'
        })
    } catch (error) {
        await cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert PDF to images',
            error: error.message
        })
    }
}

// @desc    Convert Word to PDF
export const wordToPDF = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a Word document'
            })
        }

        filesToCleanup.push(req.file.path)

        // Note: Word to PDF conversion requires LibreOffice or similar
        // For demo purposes, we'll return a placeholder response
        res.status(501).json({
            success: false,
            message: 'Word to PDF conversion requires LibreOffice installation. Please set up LibreOffice API.'
        })
    } catch (error) {
        await cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert Word to PDF',
            error: error.message
        })
    }
}

// @desc    Convert PDF to Word
export const pdfToWord = async (req, res) => {
    const filesToCleanup = []

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            })
        }

        filesToCleanup.push(req.file.path)

        // Note: PDF to Word conversion requires specialized libraries
        // For demo purposes, we'll return a placeholder response
        res.status(501).json({
            success: false,
            message: 'PDF to Word conversion requires additional libraries. Consider using pdf2docx or similar.'
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({
            success: false,
            message: 'Failed to convert PDF to Word',
            error: error.message
        })
    }
}

// @desc    Organize PDF (Reorder/Delete)
export const organizePDF = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a PDF' })

        // pages is JSON string of array indices e.g. "[0, 2, 1]"
        const pageIndices = JSON.parse(req.body.pages || '[]')

        filesToCleanup.push(req.file.path)
        const processedPdf = await PDFService.organizePDF(req.file.path, pageIndices)

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `organized-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, processedPdf)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'organized.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Failed to organize PDF', error: error.message })
    }
}

// @desc    Add Page Numbers
export const addPageNumbers = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a PDF' })

        const position = req.body.position || 'bottom-center'

        filesToCleanup.push(req.file.path)
        const processedPdf = await PDFService.addPageNumbers(req.file.path, position)

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `numbered-${Date.now()}.pdf`)
        await fs.writeFile(outputPath, processedPdf)
        filesToCleanup.push(outputPath)

        res.download(outputPath, 'numbered.pdf', async (err) => {
            await PDFService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Failed to add page numbers', error: error.message })
    }
}

// @desc    OCR Image to Text
export const ocrImage = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload an image' })

        filesToCleanup.push(req.file.path)
        const text = await PDFService.ocrImage(req.file.path)

        // cleanup immediately as we send text response
        await PDFService.cleanupFiles(filesToCleanup)

        res.json({ success: true, text })
    } catch (error) {
        await PDFService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Failed to extract text', error: error.message })
    }
}
