const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStock);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
