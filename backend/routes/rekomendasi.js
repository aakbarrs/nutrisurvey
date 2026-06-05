const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RekomendasiController = require('../controllers/RekomendasiController');

router.get('/', auth, RekomendasiController.getRekomendasi);
router.get('/preferensi', auth, RekomendasiController.getPreferensi);
router.post('/preferensi', auth, RekomendasiController.simpanPreferensi);

module.exports = router;
