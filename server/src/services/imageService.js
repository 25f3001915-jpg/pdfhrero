const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

class ImageService {
    /**
     * Compress Image with specific quality
     * @param {string} filePath - Path to input file
     * @param {Object} options - Compression options
     * @param {number} options.quality - Quality (1-100)
     * @param {string} options.format - Output format (optional, defaults to original)
     */
    static async compressImage(filePath, options = {}) {
        try {
            const quality = parseInt(options.quality) || 80
            const imageBuffer = await fs.readFile(filePath)
            const metadata = await sharp(imageBuffer).metadata()
            const format = options.format || metadata.format

            let pipeline = sharp(imageBuffer)

            // Apply compression based on format
            switch (format) {
                case 'jpeg':
                case 'jpg':
                    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
                    break
                case 'png':
                    pipeline = pipeline.png({
                        compressionLevel: Math.min(9, Math.max(0, Math.round(quality / 12))),
                        palette: quality < 80
                    })
                    break
                case 'webp':
                    pipeline = pipeline.webp({ quality })
                    break
                case 'tiff':
                    pipeline = pipeline.tiff({ quality })
                    break
                case 'gif':
                    // Sharp has limited GIF optimization
                    pipeline = pipeline.gif()
                    break
                default:
                    // If format not supported for specific compression
                    if (!['jpeg', 'png', 'webp', 'tiff'].includes(format)) {
                        console.warn(`Format ${format} compression limited.`)
                    }
            }

            return await pipeline.toBuffer()
        } catch (error) {
            throw new Error(`Failed to compress image: ${error.message}`)
        }
    }

    /**
     * Convert Image Format
     * @param {string} filePath 
     * @param {string} targetFormat - 'jpg', 'png', 'webp', 'tiff', 'gif'
     */
    static async convertImage(filePath, targetFormat) {
        try {
            const imageBuffer = await fs.readFile(filePath)
            let pipeline = sharp(imageBuffer)

            switch (targetFormat.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                    pipeline = pipeline.jpeg({ quality: 90 })
                    break
                case 'png':
                    pipeline = pipeline.png({ quality: 90 })
                    break
                case 'webp':
                    pipeline = pipeline.webp({ quality: 90 })
                    break
                case 'tiff':
                    pipeline = pipeline.tiff()
                    break
                case 'gif':
                    pipeline = pipeline.gif()
                    break
                default:
                    throw new Error(`Unsupported target format: ${targetFormat}`)
            }

            return await pipeline.toBuffer()
        } catch (error) {
            console.error('ImageService Conversion Error:', error)
            throw new Error(`Failed to convert image: ${error.message}`)
        }
    }

    /**
     * Resize Image
     */
    static async resizeImage(filePath, { width, height, maintainAspect = true }) {
        try {
            const imageBuffer = await fs.readFile(filePath)
            // if width/height are strings, parse them. If 0 or null, sharp ignores (auto)
            const w = width ? parseInt(width) : null
            const h = height ? parseInt(height) : null

            return await sharp(imageBuffer)
                .resize({
                    width: w,
                    height: h,
                    fit: maintainAspect ? 'contain' : 'fill',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background if aspect ratio padding needed
                })
                .toBuffer()
        } catch (error) {
            throw new Error(`Failed to resize image: ${error.message}`)
        }
    }

    /**
     * Rotate Image
     */
    static async rotateImage(filePath, angle) {
        try {
            const imageBuffer = await fs.readFile(filePath)
            return await sharp(imageBuffer)
                .rotate(parseInt(angle) || 90)
                .toBuffer()
        } catch (error) {
            throw new Error(`Failed to rotate image: ${error.message}`)
        }
    }

    /**
     * Crop Image
     * Expects left, top, width, height
     */
    static async cropImage(filePath, { left, top, width, height }) {
        try {
            const imageBuffer = await fs.readFile(filePath)
            return await sharp(imageBuffer)
                .extract({
                    left: parseInt(left),
                    top: parseInt(top),
                    width: parseInt(width),
                    height: parseInt(height)
                })
                .toBuffer()
        } catch (error) {
            throw new Error(`Failed to crop image: ${error.message}`)
        }
    }

    static async cleanupFiles(filePaths) {
        for (const filePath of filePaths) {
            try {
                await fs.unlink(filePath)
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    }
}

module.exports = ImageService;
