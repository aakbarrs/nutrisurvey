const PengaturanNotifikasi = require('../models/PengaturanNotifikasi');

function parseWaktuPengingat(waktuStr) {
  const times = (waktuStr || '07:00,12:00,19:00').split(',').map(t => t.trim());
  return {
    sarapan_aktif: true,
    sarapan_waktu: times[0] || '07:00',
    siang_aktif: true,
    siang_waktu: times[1] || '12:00',
    malam_aktif: true,
    malam_waktu: times[2] || '19:00'
  };
}

function buildWaktuPengingat(settings) {
  const times = [
    settings.sarapan_waktu || '07:00',
    settings.siang_waktu || '12:00',
    settings.malam_waktu || '19:00'
  ];
  return times.join(',');
}

const NotifikasiController = {
  async getPengaturan(req, res) {
    try {
      const userId = req.userId;
      const pengaturan = await PengaturanNotifikasi.getByUser(userId);

      if (!pengaturan) {
        return res.json({
          success: true,
          data: {
            sarapan_aktif: true,
            sarapan_waktu: '07:00',
            siang_aktif: true,
            siang_waktu: '12:00',
            malam_aktif: true,
            malam_waktu: '19:00'
          }
        });
      }

      const parsed = parseWaktuPengingat(pengaturan.waktu_pengingat);
      return res.json({
        success: true,
        data: {
          id: pengaturan.id,
          sarapan_aktif: parsed.sarapan_aktif && !!pengaturan.pengingat_makan,
          sarapan_waktu: parsed.sarapan_waktu,
          siang_aktif: parsed.siang_aktif && !!pengaturan.pengingat_makan,
          siang_waktu: parsed.siang_waktu,
          malam_aktif: parsed.malam_aktif && !!pengaturan.pengingat_makan,
          malam_waktu: parsed.malam_waktu
        }
      });
    } catch (error) {
      console.error('Get pengaturan error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async simpanPengaturan(req, res) {
    try {
      const userId = req.userId;
      const { sarapan_aktif, sarapan_waktu, siang_aktif, siang_waktu, malam_aktif, malam_waktu,
              pengingatMakan, pengingatMinum, pengingatTimbang, waktuPengingat } = req.body;

      const aktif = sarapan_aktif || siang_aktif || malam_aktif;
      const waktu = buildWaktuPengingat({ sarapan_waktu, siang_waktu, malam_waktu });

      await PengaturanNotifikasi.upsert(userId, {
        pengingatMakan: aktif !== undefined ? (aktif ? 1 : 0) : (pengingatMakan !== undefined ? pengingatMakan : 1),
        pengingatMinum: pengingatMinum !== undefined ? pengingatMinum : 1,
        pengingatTimbang: pengingatTimbang !== undefined ? pengingatTimbang : 0,
        waktuPengingat: waktu || waktuPengingat || '07:00,12:00,19:00'
      });

      return res.json({ success: true, message: 'Pengaturan notifikasi berhasil disimpan' });
    } catch (error) {
      console.error('Simpan pengaturan error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = NotifikasiController;
