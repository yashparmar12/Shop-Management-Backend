const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock } = req.query;
  const filter = { userId: req.user._id };

  if (category) filter.category = category;
  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, data: products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user._id };
  if (req.file) data.image = `/uploads/${req.file.filename}`;

  const product = await Product.create(data);
  if (product.stock > 0) {
    product.stockHistory.push({
      type: 'in',
      quantity: product.stock,
      previousStock: 0,
      newStock: product.stock,
      note: 'Initial stock',
      referenceType: 'manual',
    });
    await product.save();
  }

  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
  if (!product) throw new AppError('Product not found', 404);

  const oldStock = product.stock;
  const fields = ['name', 'category', 'sku', 'price', 'costPrice', 'stock', 'lowStockThreshold', 'description'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  if (req.file) product.image = `/uploads/${req.file.filename}`;

  if (req.body.stock !== undefined && Number(req.body.stock) !== oldStock) {
    const newStock = Number(req.body.stock);
    const diff = Math.abs(newStock - oldStock);
    product.stockHistory.push({
      type: newStock > oldStock ? 'in' : 'adjustment',
      quantity: diff,
      previousStock: oldStock,
      newStock,
      note: 'Manual stock update',
      referenceType: 'manual',
    });
  }

  await product.save();
  res.json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { userId: req.user._id });
  res.json({ success: true, data: categories });
});

exports.getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    userId: req.user._id,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  }).sort({ stock: 1 });
  res.json({ success: true, data: products });
});
