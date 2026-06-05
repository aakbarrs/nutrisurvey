const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BeratBadanController = require('../controllers/BeratBadanController');

router.post('/simpan', auth, BeratBadanController.simpanBerat);
router.get('/riwayat', auth, BeratBadanController.getRiwayat);

module.exports = router;
