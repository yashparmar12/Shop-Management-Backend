const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

const getDateRange = (type) => {
  const now = new Date();
  if (type === 'day') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const aggregateSales = async (userId, start, end) => {
  const result = await Sale.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$total' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { totalSales: 0, totalProfit: 0, count: 0 };
};

exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { start: monthStart, end: monthEnd } = getDateRange('month');

  const [totalProducts, lowStockItems, recentSales, monthlyStats, allTimeSales, monthlyExpenses] =
    await Promise.all([
      Product.countDocuments({ userId }),
      Product.find({
        userId,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      })
        .limit(10)
        .select('name stock lowStockThreshold category'),
      Sale.find({ userId }).sort({ createdAt: -1 }).limit(5).select('invoiceNumber total profit createdAt customerName'),
      aggregateSales(userId, monthStart, monthEnd),
      Sale.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$total' }, profit: { $sum: '$profit' } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

  const allTime = allTimeSales[0] || { total: 0, profit: 0 };
  const expenses = monthlyExpenses[0]?.total || 0;
  const profitLoss = monthlyStats.totalProfit - expenses;

  res.json({
    success: true,
    data: {
      totalProducts,
      totalSales: allTime.total,
      monthlySales: monthlyStats.totalSales,
      monthlyProfit: monthlyStats.totalProfit,
      monthlyExpenses: expenses,
      profitLoss,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentSales,
    },
  });
});

exports.getReports = asyncHandler(async (req, res) => {
  const { type = 'daily' } = req.query;
  const userId = req.user._id;

  let start;
  let end = new Date();
  const now = new Date();

  if (type === 'daily') {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date();
  } else if (type === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = new Date(req.query.startDate);
    end = new Date(req.query.endDate || Date.now());
  }

  const [salesData, expensesData, salesList] = await Promise.all([
    Sale.aggregate([
      { $match: { userId, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          profit: { $sum: '$profit' },
          cost: { $sum: '$totalCost' },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Sale.find({ userId, createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .select('invoiceNumber total profit createdAt'),
  ]);

  const sales = salesData[0] || { revenue: 0, profit: 0, cost: 0, count: 0 };
  const totalExpenses = expensesData.reduce((s, e) => s + e.total, 0);

  res.json({
    success: true,
    data: {
      period: { start, end, type },
      sales: { ...sales, netProfit: sales.profit - totalExpenses },
      expenses: expensesData,
      totalExpenses,
      salesList,
    },
  });
});
