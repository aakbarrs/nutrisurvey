const db = require('../config/database');

const ProfilNutrisi = {
  async getByUser(userId) {
    const [rows] = await db.execute('SELECT * FROM profil_nutrisi WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async upsert(userId, data) {
    const { tinggiBadan, beratBadanAwal, beratBadanTarget, usia, jenisKelamin } = data;
    const existing = await this.getByUser(userId);
    if (existing) {
      await db.execute(
        'UPDATE profil_nutrisi SET tinggi_badan = ?, berat_badan_awal = ?, berat_badan_target = ?, usia = ?, jenis_kelamin = ? WHERE user_id = ?',
        [tinggiBadan, beratBadanAwal, beratBadanTarget, usia, jenisKelamin, userId]
      );
      return { updated: true };
    } else {
      const [result] = await db.execute(
        'INSERT INTO profil_nutrisi (user_id, tinggi_badan, berat_badan_awal, berat_badan_target, usia, jenis_kelamin) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, tinggiBadan, beratBadanAwal, beratBadanTarget, usia, jenisKelamin]
      );
      return { id: result.insertId };
    }
  }
};

module.exports = ProfilNutrisi;
