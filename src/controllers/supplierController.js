const Supplier = require('../models/Supplier');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ userId: req.user._id }).sort({ shopName: 1 });
  res.json({ success: true, count: suppliers.length, data: suppliers });
});

exports.getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, userId: req.user._id });
  if (!supplier) throw new AppError('Supplier not found', 404);
  res.json({ success: true, data: supplier });
});

exports.createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: supplier });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!supplier) throw new AppError('Supplier not found', 404);
  res.json({ success: true, data: supplier });
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!supplier) throw new AppError('Supplier not found', 404);
  res.json({ success: true, message: 'Supplier deleted' });
});

exports.addPurchase = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, userId: req.user._id });
  if (!supplier) throw new AppError('Supplier not found', 404);

  supplier.purchases.push(req.body);
  await supplier.save();
  res.json({ success: true, data: supplier });
});
