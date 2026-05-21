const express = require('express');
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/:id/payments', customerController.recordPayment);

module.exports = router;
