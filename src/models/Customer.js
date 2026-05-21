const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    dueAmount: { type: Number, default: 0, min: 0 },
    paymentHistory: [paymentSchema],
  },
  { timestamps: true }
);

customerSchema.index({ userId: 1, name: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
