const MenuMakan = require('../models/MenuMakan');
const KonsumsiHarian = require('../models/KonsumsiHarian');

const KonsumsiController = {
  async searchMakanan(req, res) {
    try {
      const keyword = req.query.keyword || req.query.q || '';
      const results = keyword ? await MenuMakan.search(keyword) : await MenuMakan.getAll();
      return res.json({ success: true, data: results });
    } catch (error) {
      console.error('Search makanan error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async simpanKonsumsi(req, res) {
    try {
      const userId = req.userId;
      const { id_makanan, menuId, nama_makanan, porsi, kalori, protein, lemak, karbohidrat, tanggal, waktu_makan, waktuMakan, catatan } = req.body;

      const finalMenuId = id_makanan || menuId;
      const finalWaktu = waktu_makan || waktuMakan || 'Sarapan';
      const finalTanggal = tanggal || new Date().toISOString().split('T')[0];

      if (!finalMenuId && !nama_makanan) {
        return res.status(400).json({ success: false, message: 'Pilih makanan atau isi nama makanan' });
      }

      const id = await KonsumsiHarian.create({
        userId, menuId: finalMenuId,
        nama_makanan: nama_makanan || null,
        porsi: porsi || 1, kalori: kalori || 0,
        protein: protein || 0, lemak: lemak || 0,
        karbohidrat: karbohidrat || 0,
        tanggal: finalTanggal, waktuMakan: finalWaktu
      });

      return res.status(201).json({
        success: true,
        message: 'Konsumsi berhasil disimpan',
        data: { id, nama_makanan, porsi, kalori, waktu_makan: finalWaktu }
      });
    } catch (error) {
      console.error('Simpan konsumsi error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async hapusKonsumsi(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID konsumsi wajib diisi' });
      }

      const deleted = await KonsumsiHarian.deleteById(userId, id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      }

      return res.json({ success: true, message: 'Konsumsi berhasil dihapus' });
    } catch (error) {
      console.error('Hapus konsumsi error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async resetHariIni(req, res) {
    try {
      const userId = req.userId;
      const tanggal = req.body.tanggal || new Date().toISOString().split('T')[0];

      const deleted = await KonsumsiHarian.deleteByUserAndDate(userId, tanggal);

      return res.json({
        success: true,
        message: `${deleted} catatan berhasil dihapus`,
        data: { jumlah: deleted, tanggal }
      });
    } catch (error) {
      console.error('Reset harian error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async getKonsumsiHarian(req, res) {
    try {
      const userId = req.userId;
      const { tanggal } = req.query;

      if (!tanggal) {
        const limit = parseInt(req.query.limit) || 50;
        const items = await KonsumsiHarian.getRiwayat(userId, limit);
        return res.json({ success: true, data: items });
      }

      const items = await KonsumsiHarian.getByUserAndDate(userId, tanggal);

      const totalKalori = items.reduce((sum, item) => sum + (parseFloat(item.kalori) * item.porsi), 0);
      const totalProtein = items.reduce((sum, item) => sum + (parseFloat(item.protein) * item.porsi), 0);
      const totalKarbohidrat = items.reduce((sum, item) => sum + (parseFloat(item.karbohidrat) * item.porsi), 0);
      const totalLemak = items.reduce((sum, item) => sum + (parseFloat(item.lemak) * item.porsi), 0);

      return res.json({
        success: true,
        data: {
          tanggal,
          items,
          totalKalori: Math.round(totalKalori),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalKarbohidrat: Math.round(totalKarbohidrat * 10) / 10,
          totalLemak: Math.round(totalLemak * 10) / 10
        }
      });
    } catch (error) {
      console.error('Get konsumsi harian error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = KonsumsiController;
