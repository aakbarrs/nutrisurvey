const Pengguna = require('../models/Pengguna');

const ProfilController = {
  async getProfil(req, res) {
    try {
      const userId = req.userId;
      const user = await Pengguna.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }
      return res.json({
        success: true,
        data: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          tanggalLahir: user.tanggal_lahir,
          jenisKelamin: user.jenis_kelamin
        }
      });
    } catch (error) {
      console.error('Get profil error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = ProfilController;
