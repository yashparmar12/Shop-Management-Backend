const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/categories', expenseController.getCategories);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
