const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KonsumsiController = require('../controllers/KonsumsiController');

router.get('/search', auth, KonsumsiController.searchMakanan);
router.post('/simpan', auth, KonsumsiController.simpanKonsumsi);
router.get('/harian', auth, KonsumsiController.getKonsumsiHarian);
router.delete('/:id', auth, KonsumsiController.hapusKonsumsi);
router.post('/reset-hari', auth, KonsumsiController.resetHariIni);

module.exports = router;
