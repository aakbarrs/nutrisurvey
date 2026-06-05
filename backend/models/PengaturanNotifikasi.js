const db = require('../config/database');

const PengaturanNotifikasi = {
  async getByUser(userId) {
    const [rows] = await db.execute('SELECT * FROM pengaturan_notifikasi WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async upsert(userId, data) {
    const { pengingatMakan, pengingatMinum, pengingatTimbang, waktuPengingat } = data;
    const existing = await this.getByUser(userId);
    if (existing) {
      await db.execute(
        'UPDATE pengaturan_notifikasi SET pengingat_makan = ?, pengingat_minum = ?, pengingat_timbang = ?, waktu_pengingat = ? WHERE user_id = ?',
        [pengingatMakan, pengingatMinum, pengingatTimbang, waktuPengingat, userId]
      );
      return { updated: true };
    } else {
      const [result] = await db.execute(
        'INSERT INTO pengaturan_notifikasi (user_id, pengingat_makan, pengingat_minum, pengingat_timbang, waktu_pengingat) VALUES (?, ?, ?, ?, ?)',
        [userId, pengingatMakan, pengingatMinum, pengingatTimbang, waktuPengingat]
      );
      return { id: result.insertId };
    }
  }
};

module.exports = PengaturanNotifikasi;
