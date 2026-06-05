const KonsumsiHarian = require('../models/KonsumsiHarian');
const BeratBadan = require('../models/BeratBadan');
const PreferensiPengguna = require('../models/PreferensiPengguna');

const DashboardController = {
  async getDashboard(req, res) {
    try {
      const userId = req.userId;
      const today = new Date().toISOString().split('T')[0];

      const todayConsumption = await KonsumsiHarian.getByUserAndDate(userId, today);

      const totalKalori = todayConsumption.reduce((sum, item) => {
        return sum + (parseFloat(item.kalori) * item.porsi);
      }, 0);
      const totalProtein = todayConsumption.reduce((sum, item) => {
        return sum + (parseFloat(item.protein) * item.porsi);
      }, 0);
      const totalKarbohidrat = todayConsumption.reduce((sum, item) => {
        return sum + (parseFloat(item.karbohidrat) * item.porsi);
      }, 0);
      const totalLemak = todayConsumption.reduce((sum, item) => {
        return sum + (parseFloat(item.lemak) * item.porsi);
      }, 0);

      const latestWeight = await BeratBadan.getLatest(userId);
      const allWeights = await BeratBadan.getByUser(userId);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];

      const weeklyConsumption = await KonsumsiHarian.getByUserAndPeriod(userId, startDate, today);

      const weeklySummary = {};
      for (const item of weeklyConsumption) {
        if (!weeklySummary[item.tanggal]) {
          weeklySummary[item.tanggal] = { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 };
        }
        weeklySummary[item.tanggal].kalori += parseFloat(item.kalori) * item.porsi;
        weeklySummary[item.tanggal].protein += parseFloat(item.protein) * item.porsi;
        weeklySummary[item.tanggal].karbohidrat += parseFloat(item.karbohidrat) * item.porsi;
        weeklySummary[item.tanggal].lemak += parseFloat(item.lemak) * item.porsi;
      }

      const preferensi = await PreferensiPengguna.getByUser(userId);
      const targetKalori = preferensi ? parseFloat(preferensi.target_kalori) : 2000;

      const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const mingguan = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = weeklySummary[dateStr];
        mingguan.push({
          has_data: !!dayData,
          is_today: dateStr === today,
          over_target: dayData ? dayData.kalori > targetKalori : false,
          total_kalori: dayData ? Math.round(dayData.kalori) : 0
        });
      }

      let berat_badan = null;
      if (latestWeight) {
        const sorted = allWeights.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        const first = sorted[sorted.length - 1];
        const selisih = parseFloat(latestWeight.berat_badan) - (first ? parseFloat(first.berat_badan) : parseFloat(latestWeight.berat_badan));
        const rataRata = allWeights.reduce((s, w) => s + parseFloat(w.berat_badan), 0) / allWeights.length;
        berat_badan = {
          terakhir: parseFloat(latestWeight.berat_badan),
          rata_rata: Math.round(rataRata * 10) / 10,
          trend: selisih > 0 ? 'naik' : selisih < 0 ? 'turun' : 'stabil',
          selisih: Math.round(selisih * 10) / 10
        };
      }

      return res.json({
        success: true,
        data: {
          kalori_terpakai: Math.round(totalKalori),
          target_kalori: Math.round(targetKalori),
          nutrisi_makro: {
            protein: { jumlah: Math.round(totalProtein * 10) / 10, target: 60 },
            lemak: { jumlah: Math.round(totalLemak * 10) / 10, target: 65 },
            karbohidrat: { jumlah: Math.round(totalKarbohidrat * 10) / 10, target: 300 }
          },
          mingguan,
          makanan_hari_ini: todayConsumption.map(item => ({
            id: item.id,
            nama_makanan: item.nama_makanan,
            kalori: Math.round(parseFloat(item.kalori) * item.porsi),
            porsi: item.porsi,
            protein: parseFloat(item.protein),
            lemak: parseFloat(item.lemak),
            karbohidrat: parseFloat(item.karbohidrat),
            waktu_makan: item.waktu_makan
          })),
          berat_badan,
          rekomendasi: {
            icon: '🥗',
            judul: 'Rekomendasi Menu',
            deskripsi: preferensi ? 'Lihat rekomendasi menu berdasarkan preferensi Anda' : 'Atur preferensi untuk mendapatkan rekomendasi'
          }
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = DashboardController;
