const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProfilController = require('../controllers/ProfilController');

router.get('/', auth, ProfilController.getProfil);

module.exports = router;
