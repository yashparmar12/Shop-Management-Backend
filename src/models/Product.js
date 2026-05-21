const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    note: { type: String, trim: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceType: { type: String, enum: ['sale', 'purchase', 'manual'] },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    image: { type: String },
    description: { type: String, trim: true },
    stockHistory: [stockHistorySchema],
  },
  { timestamps: true }
);

productSchema.index({ userId: 1, name: 'text', category: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);
