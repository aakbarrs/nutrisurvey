const BeratBadan = require('../models/BeratBadan');

const BeratBadanController = {
  async simpanBerat(req, res) {
    try {
      const userId = req.userId;
      const { berat, beratBadan, tanggal, catatan } = req.body;
      const finalBerat = berat || beratBadan;

      if (!finalBerat || !tanggal) {
        return res.status(400).json({ success: false, message: 'Berat badan dan tanggal wajib diisi' });
      }

      const id = await BeratBadan.create({ userId, beratBadan: finalBerat, tanggal, catatan });

      return res.status(201).json({
        success: true,
        message: 'Berat badan berhasil disimpan',
        data: { id, berat: finalBerat, tanggal, catatan }
      });
    } catch (error) {
      console.error('Simpan berat error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async getRiwayat(req, res) {
    try {
      const userId = req.userId;
      const riwayat = await BeratBadan.getByUser(userId);

      const data = riwayat.map(item => ({
        id: item.id,
        berat: parseFloat(item.berat_badan),
        beratBadan: parseFloat(item.berat_badan),
        tanggal: item.tanggal,
        catatan: item.catatan
      }));

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Get riwayat berat error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = BeratBadanController;
