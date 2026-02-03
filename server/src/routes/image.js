import express from 'express'
import upload, { handleMulterError } from '../middleware/upload.js'
import { compressImage, convertImage, resizeImage, rotateImage, cropImage } from '../controllers/imageController.js'

const router = express.Router()

router.post('/compress', upload.single('file'), handleMulterError, compressImage)
router.post('/convert', upload.single('file'), handleMulterError, convertImage)
router.post('/resize', upload.single('file'), handleMulterError, resizeImage)
router.post('/rotate', upload.single('file'), handleMulterError, rotateImage)
router.post('/crop', upload.single('file'), handleMulterError, cropImage)

export default router
