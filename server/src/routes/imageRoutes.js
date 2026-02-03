const express = require('express');
const router = express.Router();
const { compressImage, convertImage, resizeImage, rotateImage, cropImage } = require('../controllers/imageController');

// Image processing routes
router.post('/compress', compressImage);
router.post('/convert', convertImage);
router.post('/resize', resizeImage);
router.post('/rotate', rotateImage);
router.post('/crop', cropImage);

module.exports = router;