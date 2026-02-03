const ImageService = require('../services/imageService');
const path = require('path');
const fs = require('fs/promises');

// @desc    Compress Image
const compressImage = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.files || !req.files.file) return res.status(400).json({ message: 'Please upload an image' })

        const file = req.files.file;
        filesToCleanup.push(file.tempFilePath)

        const quality = req.body.quality || 80
        const compressedBuffer = await ImageService.compressImage(file.tempFilePath, { quality })

        const originalExt = path.extname(file.name)
        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `compressed-${Date.now()}${originalExt}`)

        await fs.writeFile(outputPath, compressedBuffer)
        filesToCleanup.push(outputPath)

        res.download(outputPath, `compressed${originalExt}`, async (err) => {
            await ImageService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await ImageService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Failed to compress image', error: error.message })
    }
}

// @desc    Convert Image Format
const convertImage = async (req, res) => {
    const filesToCleanup = []
    try {
        console.log('Convert Request Body:', req.body)
        console.log('Convert Request File:', req.files?.file)

        if (!req.files || !req.files.file) return res.status(400).json({ message: 'Please upload an image' })

        const file = req.files.file;
        filesToCleanup.push(file.tempFilePath)

        const targetFormat = req.body.format || 'jpg'
        const convertedBuffer = await ImageService.convertImage(file.tempFilePath, targetFormat)

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `converted-${Date.now()}.${targetFormat}`)

        await fs.writeFile(outputPath, convertedBuffer)
        filesToCleanup.push(outputPath)

        res.download(outputPath, `converted-image.${targetFormat}`, async (err) => {
            await ImageService.cleanupFiles(filesToCleanup)
            if (err) console.error('Download error:', err)
        })
    } catch (error) {
        await ImageService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Failed to convert image', error: error.message })
    }
}

// @desc    Resize Image
const resizeImage = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.files || !req.files.file) return res.status(400).json({ message: 'Please upload an image' })
        const file = req.files.file;
        filesToCleanup.push(file.tempFilePath)

        const { width, height, maintainAspect } = req.body
        const buffer = await ImageService.resizeImage(file.tempFilePath, { width, height, maintainAspect: maintainAspect === 'true' })

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `resized-${Date.now()}.png`)
        await fs.writeFile(outputPath, buffer)
        filesToCleanup.push(outputPath)

        res.download(outputPath, `resized-image.png`, async (err) => {
            await ImageService.cleanupFiles(filesToCleanup)
            if (err) console.error(err)
        })
    } catch (error) {
        await ImageService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Resize failed', error: error.message })
    }
}

// @desc    Rotate Image
const rotateImage = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.files || !req.files.file) return res.status(400).json({ message: 'Please upload an image' })
        const file = req.files.file;
        filesToCleanup.push(file.tempFilePath)

        const angle = req.body.angle || 90
        const buffer = await ImageService.rotateImage(file.tempFilePath, angle)

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `rotated-${Date.now()}.jpg`)
        await fs.writeFile(outputPath, buffer)
        filesToCleanup.push(outputPath)

        res.download(outputPath, `rotated-image.jpg`, async (err) => {
            await ImageService.cleanupFiles(filesToCleanup)
            if (err) console.error(err)
        })
    } catch (error) {
        await ImageService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Rotate failed', error: error.message })
    }
}

// @desc    Crop Image
const cropImage = async (req, res) => {
    const filesToCleanup = []
    try {
        if (!req.files || !req.files.file) return res.status(400).json({ message: 'Please upload an image' })
        const file = req.files.file;
        filesToCleanup.push(file.tempFilePath)

        const { left, top, width, height } = req.body
        const buffer = await ImageService.cropImage(file.tempFilePath, { left, top, width, height })

        const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', `cropped-${Date.now()}.jpg`)
        await fs.writeFile(outputPath, buffer)
        filesToCleanup.push(outputPath)

        res.download(outputPath, `cropped-image.jpg`, async (err) => {
            await ImageService.cleanupFiles(filesToCleanup)
            if (err) console.error(err)
        })
    } catch (error) {
        await ImageService.cleanupFiles(filesToCleanup)
        res.status(500).json({ success: false, message: 'Crop failed', error: error.message })
    }
}

module.exports = {
    compressImage,
    convertImage,
    resizeImage,
    rotateImage,
    cropImage
};
