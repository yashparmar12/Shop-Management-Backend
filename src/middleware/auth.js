const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. Please login.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }
    req.user = user;
    next();
  } catch {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

module.exports = { protect };
