const db = require('../config/database');

function normalizeRow(row) {
  return {
    ...row,
    nama_makanan: row.nama_makanan || row.menu_nama || null,
    kalori: row.kalori || row.menu_kalori || 0,
    protein: row.protein || row.menu_protein || 0,
    karbohidrat: row.karbohidrat || row.menu_karbohidrat || 0,
    lemak: row.lemak || row.menu_lemak || 0
  };
}

const KonsumsiHarian = {
  async create(data) {
    const { userId, menuId, porsi, tanggal, waktuMakan, nama_makanan, kalori, protein, lemak, karbohidrat } = data;
    const [result] = await db.execute(
      'INSERT INTO konsumsi_harian (user_id, menu_id, nama_makanan, porsi, kalori, protein, lemak, karbohidrat, tanggal, waktu_makan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, menuId || null, nama_makanan || null, porsi || 1, kalori || 0, protein || 0, lemak || 0, karbohidrat || 0, tanggal, waktuMakan || 'Sarapan']
    );
    return result.insertId;
  },

  async getByUserAndDate(userId, tanggal) {
    const [rows] = await db.execute(
      `SELECT kh.*, mm.nama_makanan as menu_nama, mm.kalori as menu_kalori,
              mm.protein as menu_protein, mm.karbohidrat as menu_karbohidrat,
              mm.lemak as menu_lemak, mm.emoji, mm.kategori
       FROM konsumsi_harian kh
       LEFT JOIN menu_makanan mm ON kh.menu_id = mm.id
       WHERE kh.user_id = ? AND kh.tanggal = ?
       ORDER BY kh.waktu_makan ASC`,
      [userId, tanggal]
    );
    return rows.map(normalizeRow);
  },

  async getByUserAndPeriod(userId, startDate, endDate) {
    const [rows] = await db.execute(
      `SELECT kh.*, mm.nama_makanan as menu_nama, mm.kalori as menu_kalori,
              mm.protein as menu_protein, mm.karbohidrat as menu_karbohidrat,
              mm.lemak as menu_lemak, mm.emoji, mm.kategori
       FROM konsumsi_harian kh
       LEFT JOIN menu_makanan mm ON kh.menu_id = mm.id
       WHERE kh.user_id = ? AND kh.tanggal BETWEEN ? AND ?
       ORDER BY kh.tanggal DESC, kh.waktu_makan ASC`,
      [userId, startDate, endDate]
    );
    return rows.map(normalizeRow);
  },

  async getRiwayat(userId, limit = 50) {
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
    const [rows] = await db.execute(
      `SELECT kh.*, mm.nama_makanan as menu_nama, mm.kalori as menu_kalori,
              mm.protein as menu_protein, mm.karbohidrat as menu_karbohidrat,
              mm.lemak as menu_lemak, mm.emoji, mm.kategori
       FROM konsumsi_harian kh
       LEFT JOIN menu_makanan mm ON kh.menu_id = mm.id
       WHERE kh.user_id = ?
       ORDER BY kh.created_at DESC
       LIMIT ${safeLimit}`,
      [userId]
    );
    return rows.map(normalizeRow);
  },

  async deleteById(userId, id) {
    const [result] = await db.execute(
      'DELETE FROM konsumsi_harian WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async deleteByUserAndDate(userId, tanggal) {
    const [result] = await db.execute(
      'DELETE FROM konsumsi_harian WHERE user_id = ? AND tanggal = ?',
      [userId, tanggal]
    );
    return result.affectedRows;
  }
};

module.exports = KonsumsiHarian;
