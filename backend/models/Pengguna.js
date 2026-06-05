const db = require('../config/database');
const crypto = require('crypto');

const Pengguna = {
  async create(data) {
    const { nama, email, password } = data;
    const token = crypto.randomBytes(32).toString('hex');
    const [result] = await db.execute(
      'INSERT INTO pengguna (nama, email, password, token_verifikasi) VALUES (?, ?, ?, ?)',
      [nama, email, password, token]
    );
    return { id: result.insertId, tokenVerifikasi: token };
  },

  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM pengguna WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, nama, email, email_terverifikasi, created_at FROM pengguna WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async verifyEmail(token) {
    const [rows] = await db.execute('SELECT * FROM pengguna WHERE token_verifikasi = ?', [token]);
    if (rows.length === 0) return null;
    await db.execute('UPDATE pengguna SET email_terverifikasi = 1, token_verifikasi = NULL WHERE id = ?', [rows[0].id]);
    return rows[0];
  }
};

module.exports = Pengguna;
