const db = require('../config/database');

const BeratBadan = {
  async create(data) {
    const { userId, beratBadan, tanggal, catatan } = data;
    const [result] = await db.execute(
      'INSERT INTO berat_badan (user_id, berat_badan, tanggal, catatan) VALUES (?, ?, ?, ?)',
      [userId, beratBadan, tanggal, catatan]
    );
    return result.insertId;
  },

  async getByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM berat_badan WHERE user_id = ? ORDER BY tanggal DESC',
      [userId]
    );
    return rows;
  },

  async getLatest(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM berat_badan WHERE user_id = ? ORDER BY tanggal DESC LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  }
};

module.exports = BeratBadan;
