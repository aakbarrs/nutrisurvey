const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LaporanController = require('../controllers/LaporanController');

router.get('/', auth, LaporanController.buatLaporan);
router.get('/riwayat', auth, LaporanController.getRiwayatLaporan);
router.get('/cek-data', auth, LaporanController.cekDataTersedia);

module.exports = router;
