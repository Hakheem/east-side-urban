const express = require('express');
const { handleImageUpload, addProduct, fetchProducts, editProduct, deleteProduct } = require('../../controllers/admin/productsController');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

router.post('/upload-image', upload.single('image'), handleImageUpload);
router.post('/add', addProduct);
router.get('/fetch', fetchProducts);
router.put('/edit/:id', editProduct);
router.delete('/delete/:id', deleteProduct);



module.exports = router;
 