const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
  if (!expense) throw new AppError('Expense not found', 404);
  res.json({ success: true, data: expense });
});

exports.getExpenses = asyncHandler(async (req, res) => {
  const { startDate, endDate, category, month, year } = req.query;
  const filter = { userId: req.user._id };

  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({ success: true, count: expenses.length, total, data: expenses });
});

exports.createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: expense });
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!expense) throw new AppError('Expense not found', 404);
  res.json({ success: true, data: expense });
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!expense) throw new AppError('Expense not found', 404);
  res.json({ success: true, message: 'Expense deleted' });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Expense.distinct('category', { userId: req.user._id });
  res.json({ success: true, data: categories });
});
