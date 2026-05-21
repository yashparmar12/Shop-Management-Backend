const express = require('express');
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);
router.post('/:id/purchases', supplierController.addPurchase);

module.exports = router;
