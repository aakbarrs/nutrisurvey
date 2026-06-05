const db = require('../config/database');

const MenuMakan = {
  async search(keyword) {
    const [rows] = await db.execute(
      'SELECT * FROM menu_makanan WHERE nama_makanan LIKE ? ORDER BY nama_makanan ASC',
      [`%${keyword}%`]
    );
    return rows;
  },

  async getDetail(menuId) {
    const [rows] = await db.execute('SELECT * FROM menu_makanan WHERE id = ?', [menuId]);
    return rows[0] || null;
  },

  async getAll() {
    const [rows] = await db.execute('SELECT * FROM menu_makanan ORDER BY nama_makanan ASC');
    return rows;
  }
};

module.exports = MenuMakan;
