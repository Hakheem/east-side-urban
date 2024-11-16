const express = require('express');
const { handleImageUpload } = require('../../controllers/admin/productsController'); // Correct path
const { upload } = require('../../config/cloudinary'); // Make sure this is set up properly

const router = express.Router();

// Upload image route
router.post('/upload-image', upload.single('image'), handleImageUpload);

module.exports = router;
