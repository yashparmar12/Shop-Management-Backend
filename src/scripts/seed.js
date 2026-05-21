require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Expense = require('../models/Expense');
const Sale = require('../models/Sale');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop_inventory');
  console.log('Connected for seeding...');

  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Customer.deleteMany(),
    Supplier.deleteMany(),
    Expense.deleteMany(),
    Sale.deleteMany(),
  ]);

  const user = await User.create({
    name: 'Rajesh Kumar',
    email: 'admin@shop.com',
    password: 'admin123',
    shopName: 'Kumar General Store',
    phone: '9876543210',
    address: '123 Main Market, Delhi',
  });

  const products = await Product.insertMany([
    {
      userId: user._id,
      name: 'Basmati Rice 1kg',
      category: 'Grocery',
      sku: 'RICE-001',
      price: 120,
      costPrice: 95,
      stock: 50,
      lowStockThreshold: 10,
    },
    {
      userId: user._id,
      name: 'Sunflower Oil 1L',
      category: 'Grocery',
      sku: 'OIL-001',
      price: 180,
      costPrice: 150,
      stock: 8,
      lowStockThreshold: 10,
    },
    {
      userId: user._id,
      name: 'Surf Excel 1kg',
      category: 'Household',
      sku: 'DET-001',
      price: 220,
      costPrice: 185,
      stock: 25,
      lowStockThreshold: 5,
    },
    {
      userId: user._id,
      name: 'Amul Butter 500g',
      category: 'Dairy',
      sku: 'DAI-001',
      price: 290,
      costPrice: 250,
      stock: 15,
      lowStockThreshold: 5,
    },
    {
      userId: user._id,
      name: 'Tata Salt 1kg',
      category: 'Grocery',
      sku: 'SALT-001',
      price: 28,
      costPrice: 22,
      stock: 100,
      lowStockThreshold: 20,
    },
  ]);

  const customers = await Customer.insertMany([
    {
      userId: user._id,
      name: 'Amit Sharma',
      phone: '9988776655',
      dueAmount: 500,
      paymentHistory: [{ amount: 200, method: 'cash', note: 'Partial payment' }],
    },
    {
      userId: user._id,
      name: 'Priya Singh',
      phone: '8877665544',
      dueAmount: 0,
    },
  ]);

  await Supplier.create({
    userId: user._id,
    shopName: 'Wholesale Mart',
    ownerName: 'Suresh Patel',
    mobile: '9123456780',
    address: 'Industrial Area, Phase 2',
    purchases: [
      { items: 'Rice, Oil bulk', amount: 15000, purchaseDate: new Date(), notes: 'Monthly stock' },
    ],
  });

  await Expense.insertMany([
    {
      userId: user._id,
      title: 'Shop Rent',
      category: 'Rent',
      amount: 12000,
      date: new Date(),
    },
    {
      userId: user._id,
      title: 'Electricity Bill',
      category: 'Utilities',
      amount: 2500,
      date: new Date(),
    },
  ]);

  const saleItems = [
    {
      productId: products[0]._id,
      name: products[0].name,
      quantity: 2,
      price: products[0].price,
      costPrice: products[0].costPrice,
      total: products[0].price * 2,
    },
    {
      productId: products[2]._id,
      name: products[2].name,
      quantity: 1,
      price: products[2].price,
      costPrice: products[2].costPrice,
      total: products[2].price,
    },
  ];

  const subtotal = 460;
  const totalCost = 95 * 2 + 185;
  const taxAmount = 0;
  const total = subtotal;

  await Sale.create({
    userId: user._id,
    invoiceNumber: 'INV-202505-0001',
    customerName: customers[0].name,
    customerId: customers[0]._id,
    items: saleItems,
    subtotal,
    discount: 0,
    taxRate: 0,
    taxAmount,
    total,
    totalCost,
    profit: total - totalCost,
    paymentMethod: 'cash',
    amountPaid: total,
    dueAmount: 0,
  });

  const rice = await Product.findById(products[0]._id);
  if (rice) {
    const prev = rice.stock;
    rice.stock -= 2;
    rice.stockHistory.push({
      type: 'out',
      quantity: 2,
      previousStock: prev,
      newStock: rice.stock,
      note: 'Seed sale',
      referenceType: 'sale',
    });
    await rice.save();
  }

  const surf = await Product.findById(products[2]._id);
  if (surf) {
    const prev = surf.stock;
    surf.stock -= 1;
    surf.stockHistory.push({
      type: 'out',
      quantity: 1,
      previousStock: prev,
      newStock: surf.stock,
      note: 'Seed sale',
      referenceType: 'sale',
    });
    await surf.save();
  }

  console.log('Seed completed!');
  console.log('Login: admin@shop.com / admin123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
