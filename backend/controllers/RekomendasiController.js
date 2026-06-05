const KonsumsiHarian = require('../models/KonsumsiHarian');
const MenuMakan = require('../models/MenuMakan');
const PreferensiPengguna = require('../models/PreferensiPengguna');

const RekomendasiController = {
  async getRekomendasi(req, res) {
    try {
      const userId = req.userId;
      const today = new Date().toISOString().split('T')[0];

      const preferensi = await PreferensiPengguna.getByUser(userId);
      const targetKalori = preferensi ? parseFloat(preferensi.target_kalori) : 2000;

      const todayConsumption = await KonsumsiHarian.getByUserAndDate(userId, today);
      const totalKaloriTerpakai = todayConsumption.reduce((sum, item) => {
        return sum + (parseFloat(item.kalori) * item.porsi);
      }, 0);

      const sisaKalori = targetKalori - totalKaloriTerpakai;

      const preferensiMakan = preferensi ? (preferensi.preferensi_makan || 'semua') : 'semua';

      const allMenus = await MenuMakan.getAll();

      const rekomendasi = allMenus.filter(menu => {
        const kaloriMenu = parseFloat(menu.kalori);
        if (kaloriMenu <= 0) return false;

        const maxKalori = sisaKalori > 0 ? sisaKalori + 50 : sisaKalori + 500;
        if (kaloriMenu > maxKalori) return false;

        if (preferensiMakan === 'vegetarian' && menu.tipe_diet !== 'vegetarian') return false;
        if (preferensiMakan === 'vegan' && menu.tipe_diet !== 'vegan') return false;
        if (preferensiMakan === 'rendah_karbo' && parseFloat(menu.karbohidrat) > 20) return false;
        if (preferensiMakan === 'tinggi_protein' && parseFloat(menu.protein) < 20) return false;

        return true;
      }).sort((a, b) => {
        return Math.abs(parseFloat(a.kalori) - Math.max(sisaKalori, 0)) - Math.abs(parseFloat(b.kalori) - Math.max(sisaKalori, 0));
      }).slice(0, 20).map(menu => ({
        id: menu.id,
        id_makanan: menu.id,
        nama: menu.nama_makanan,
        nama_menu: menu.nama_makanan,
        kalori: parseFloat(menu.kalori),
        protein: parseFloat(menu.protein),
        lemak: parseFloat(menu.lemak),
        karbohidrat: parseFloat(menu.karbohidrat),
        emoji: menu.emoji || '🍲',
        waktu_makan: menu.kategori || 'Lainnya',
        kategori: menu.kategori || 'Lainnya',
        tipe_diet: menu.tipe_diet || 'normal',
        porsi_saran: menu.porsi_saran || '1 porsi',
        deskripsi: menu.deskripsi || ''
      }));

      return res.json({
        success: true,
        data: {
          sisaKalori: Math.round(sisaKalori),
          targetKalori: Math.round(targetKalori),
          kalori_terpakai: Math.round(totalKaloriTerpakai),
          preferensi_aktif: preferensiMakan,
          rekomendasi
        }
      });
    } catch (error) {
      console.error('Rekomendasi error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async getPreferensi(req, res) {
    try {
      const userId = req.userId;
      const pref = await PreferensiPengguna.getByUser(userId);

      if (!pref) {
        return res.json({ success: true, data: null });
      }

      return res.json({
        success: true,
        data: {
          id: pref.id,
          tujuan: pref.alasan_diet || pref.tujuan || 'jaga',
          preferensi_makan: pref.preferensi_makan || 'semua',
          alergi: pref.alergi || '',
          jumlah_makan: pref.jumlah_makan || 3,
          target_kalori: parseFloat(pref.target_kalori)
        }
      });
    } catch (error) {
      console.error('Get preferensi error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async simpanPreferensi(req, res) {
    try {
      const userId = req.userId;
      const { tujuan, preferensi_makan, alergi, jumlah_makan, targetKalori, preferensiMakan, alasanDiet, tingkatAktivitas } = req.body;

      const data = {
        targetKalori: targetKalori || 2000,
        preferensiMakan: preferensi_makan || preferensiMakan || 'semua',
        alasanDiet: tujuan || alasanDiet || 'jaga',
        tingkatAktivitas: tingkatAktivitas || 'sedang',
        alergi: alergi || '',
        jumlah_makan: parseInt(jumlah_makan) || 3
      };

      await PreferensiPengguna.upsert(userId, data);

      return res.json({ success: true, message: 'Preferensi berhasil disimpan' });
    } catch (error) {
      console.error('Simpan preferensi error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = RekomendasiController;
