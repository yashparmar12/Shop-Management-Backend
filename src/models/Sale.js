const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, trim: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true },
    totalCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'credit'], default: 'cash' },
    amountPaid: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

saleSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
