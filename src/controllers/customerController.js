const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { userId: req.user._id };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  const customers = await Customer.find(filter).sort({ name: 1 });
  res.json({ success: true, count: customers.length, data: customers });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, data: customer });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: customer });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, data: customer });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, message: 'Customer deleted' });
});

exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, note } = req.body;
  const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
  if (!customer) throw new AppError('Customer not found', 404);
  if (amount > customer.dueAmount) {
    throw new AppError('Payment exceeds due amount', 400);
  }

  customer.dueAmount -= amount;
  customer.paymentHistory.push({ amount, method, note });
  await customer.save();

  res.json({ success: true, data: customer });
});
