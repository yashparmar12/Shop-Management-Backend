const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/forgot-password', [body('email').isEmail()], validate, authController.forgotPassword);

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 6 })],
  validate,
  authController.resetPassword
);

router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
