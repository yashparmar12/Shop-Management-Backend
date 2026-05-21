const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const generateInvoiceNumber = async (userId) => {
  const count = await Sale.countDocuments({ userId });
  const date = new Date();
  const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

exports.createSale = asyncHandler(async (req, res) => {
  const { items, discount = 0, taxRate = 0, customerId, customerName, paymentMethod, amountPaid, notes } =
    req.body;

  if (!items?.length) throw new AppError('Sale must have at least one item', 400);

  let subtotal = 0;
  let totalCost = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, userId: req.user._id });
    if (!product) throw new AppError(`Product not found: ${item.productId}`, 404);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const lineTotal = product.price * item.quantity;
    const lineCost = product.costPrice * item.quantity;
    subtotal += lineTotal;
    totalCost += lineCost;

    saleItems.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      costPrice: product.costPrice,
      total: lineTotal,
    });

    const previousStock = product.stock;
    product.stock -= item.quantity;
    product.stockHistory.push({
      type: 'out',
      quantity: item.quantity,
      previousStock,
      newStock: product.stock,
      note: 'Sale',
      referenceType: 'sale',
    });
    await product.save();
  }

  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;
  const profit = total - totalCost;
  const paid = amountPaid ?? total;
  const dueAmount = Math.max(0, total - paid);

  if (customerId && dueAmount > 0) {
    const customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    if (customer) {
      customer.dueAmount += dueAmount;
      await customer.save();
    }
  }

  const invoiceNumber = await generateInvoiceNumber(req.user._id);

  const sale = await Sale.create({
    userId: req.user._id,
    invoiceNumber,
    customerId,
    customerName,
    items: saleItems,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    total,
    totalCost,
    profit,
    paymentMethod,
    amountPaid: paid,
    dueAmount,
    notes,
  });

  res.status(201).json({ success: true, data: sale });
});

exports.getSales = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 50 } = req.query;
  const filter = { userId: req.user._id };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sales = await Sale.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('customerId', 'name phone');

  res.json({ success: true, count: sales.length, data: sales });
});

exports.getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, userId: req.user._id }).populate(
    'customerId',
    'name phone'
  );
  if (!sale) throw new AppError('Sale not found', 404);
  res.json({ success: true, data: sale });
});
