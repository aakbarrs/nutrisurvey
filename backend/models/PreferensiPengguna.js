const db = require('../config/database');

const PreferensiPengguna = {
  async getByUser(userId) {
    const [rows] = await db.execute('SELECT * FROM preferensi_pengguna WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async upsert(userId, data) {
    const { targetKalori, preferensiMakan, alasanDiet, tingkatAktivitas, alergi, jumlah_makan } = data;
    const existing = await this.getByUser(userId);
    const params = {
      targetKalori: targetKalori || 2000,
      preferensiMakan: preferensiMakan || 'semua',
      alasanDiet: alasanDiet || 'jaga',
      tingkatAktivitas: tingkatAktivitas || 'sedang',
      alergi: alergi || '',
      jumlah_makan: jumlah_makan || 3
    };
    if (existing) {
      await db.execute(
        'UPDATE preferensi_pengguna SET target_kalori = ?, preferensi_makan = ?, alasan_diet = ?, tingkat_aktivitas = ?, alergi = ?, jumlah_makan = ? WHERE user_id = ?',
        [params.targetKalori, params.preferensiMakan, params.alasanDiet, params.tingkatAktivitas, params.alergi, params.jumlah_makan, userId]
      );
      return { updated: true };
    } else {
      const [result] = await db.execute(
        'INSERT INTO preferensi_pengguna (user_id, target_kalori, preferensi_makan, alasan_diet, tingkat_aktivitas, alergi, jumlah_makan) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, params.targetKalori, params.preferensiMakan, params.alasanDiet, params.tingkatAktivitas, params.alergi, params.jumlah_makan]
      );
      return { id: result.insertId };
    }
  }
};

module.exports = PreferensiPengguna;
