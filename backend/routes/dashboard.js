const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DashboardController = require('../controllers/DashboardController');

router.get('/', auth, DashboardController.getDashboard);

module.exports = router;
