const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    items: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const supplierSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    purchases: [purchaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
