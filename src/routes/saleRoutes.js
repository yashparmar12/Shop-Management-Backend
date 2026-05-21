const express = require('express');
const saleController = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', saleController.getSales);
router.get('/:id', saleController.getSale);
router.post('/', saleController.createSale);

module.exports = router;
