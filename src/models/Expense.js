const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
