const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', dashboardController.getDashboard);
router.get('/reports', dashboardController.getReports);

module.exports = router;
