const db = require('../config/database');

const LaporanAnalisis = {
  async create(data) {
    const { userId, periode, startDate, endDate, totalKalori, totalProtein, totalKarbohidrat, totalLemak, rataRataKalori, rataRataBerat, hariTercapai, totalHari, dataLengkap } = data;
    const [result] = await db.execute(
      `INSERT INTO laporan_analisis (user_id, periode, start_date, end_date, total_kalori, total_protein, total_karbohidrat, total_lemak, rata_rata_kalori, rata_rata_berat, hari_tercapai, total_hari, data_lengkap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_kalori = VALUES(total_kalori),
         total_protein = VALUES(total_protein),
         total_karbohidrat = VALUES(total_karbohidrat),
         total_lemak = VALUES(total_lemak),
         rata_rata_kalori = VALUES(rata_rata_kalori),
         rata_rata_berat = VALUES(rata_rata_berat),
         hari_tercapai = VALUES(hari_tercapai),
         total_hari = VALUES(total_hari),
         data_lengkap = VALUES(data_lengkap),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, periode, startDate, endDate, totalKalori, totalProtein, totalKarbohidrat, totalLemak, rataRataKalori, rataRataBerat, hariTercapai, totalHari, dataLengkap ? JSON.stringify(dataLengkap) : null]
    );
    return result.insertId;
  },

  async getByUserAndPeriod(userId, periode, endDate) {
    const [rows] = await db.execute(
      'SELECT * FROM laporan_analisis WHERE user_id = ? AND periode = ? AND end_date = ?',
      [userId, periode, endDate]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    if (row.data_lengkap && typeof row.data_lengkap === 'string') {
      try { row.data_lengkap = JSON.parse(row.data_lengkap); } catch (e) { row.data_lengkap = null; }
    }
    return row;
  },

  async getRiwayat(userId, limit = 10) {
    const [rows] = await db.execute(
      'SELECT * FROM laporan_analisis WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, Math.min(Math.max(parseInt(limit) || 10, 1), 50)]
    );
    return rows.map(row => {
      if (row.data_lengkap && typeof row.data_lengkap === 'string') {
        try { row.data_lengkap = JSON.parse(row.data_lengkap); } catch (e) { row.data_lengkap = null; }
      }
      return row;
    });
  },

  async getLatestByPeriode(userId, periode) {
    const [rows] = await db.execute(
      'SELECT * FROM laporan_analisis WHERE user_id = ? AND periode = ? ORDER BY end_date DESC LIMIT 1',
      [userId, periode]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    if (row.data_lengkap && typeof row.data_lengkap === 'string') {
      try { row.data_lengkap = JSON.parse(row.data_lengkap); } catch (e) { row.data_lengkap = null; }
    }
    return row;
  },

  async deleteByUserAndPeriode(userId, periode, endDate) {
    const [result] = await db.execute(
      'DELETE FROM laporan_analisis WHERE user_id = ? AND periode = ? AND end_date = ?',
      [userId, periode, endDate]
    );
    return result.affectedRows > 0;
  }
};

module.exports = LaporanAnalisis;
