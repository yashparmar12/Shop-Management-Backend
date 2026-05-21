const path = require('path');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Shop Inventory API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

module.exports = app;
