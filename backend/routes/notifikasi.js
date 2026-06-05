const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const NotifikasiController = require('../controllers/NotifikasiController');

router.get('/pengaturan', auth, NotifikasiController.getPengaturan);
router.post('/simpan', auth, NotifikasiController.simpanPengaturan);

module.exports = router;
