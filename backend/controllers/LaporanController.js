const KonsumsiHarian = require('../models/KonsumsiHarian');
const BeratBadan = require('../models/BeratBadan');
const LaporanAnalisis = require('../models/LaporanAnalisis');

const LaporanController = {
  async buatLaporan(req, res) {
    try {
      const userId = req.userId;
      const { periode } = req.query;

      const today = new Date();
      let startDate;

      switch (periode) {
        case 'harian':
          startDate = today.toISOString().split('T')[0];
          break;
        case 'mingguan':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'bulanan':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const endDate = today.toISOString().split('T')[0];

      const konsumsi = await KonsumsiHarian.getByUserAndPeriod(userId, startDate, endDate);

      const totalKalori = konsumsi.reduce((sum, item) => sum + (parseFloat(item.kalori) * item.porsi), 0);
      const totalProtein = konsumsi.reduce((sum, item) => sum + (parseFloat(item.protein) * item.porsi), 0);
      const totalKarbohidrat = konsumsi.reduce((sum, item) => sum + (parseFloat(item.karbohidrat) * item.porsi), 0);
      const totalLemak = konsumsi.reduce((sum, item) => sum + (parseFloat(item.lemak) * item.porsi), 0);

      const hari = konsumsi.reduce((days, item) => {
        if (!days.includes(item.tanggal)) days.push(item.tanggal);
        return days;
      }, []).length || 1;

      const beratRecords = await BeratBadan.getByUser(userId);
      const beratDalamPeriode = beratRecords.filter(r => r.tanggal >= startDate && r.tanggal <= endDate);

      const rataBerat = beratDalamPeriode.length > 0
        ? beratDalamPeriode.reduce((sum, r) => sum + parseFloat(r.berat_badan), 0) / beratDalamPeriode.length
        : (beratRecords.length > 0 ? parseFloat(beratRecords[0].berat_badan) : 0);

      const rekapHarian = {};
      for (const item of konsumsi) {
        if (!rekapHarian[item.tanggal]) {
          rekapHarian[item.tanggal] = { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 };
        }
        rekapHarian[item.tanggal].kalori += parseFloat(item.kalori) * item.porsi;
        rekapHarian[item.tanggal].protein += parseFloat(item.protein) * item.porsi;
        rekapHarian[item.tanggal].karbohidrat += parseFloat(item.karbohidrat) * item.porsi;
        rekapHarian[item.tanggal].lemak += parseFloat(item.lemak) * item.porsi;
      }

      const harianArray = Object.entries(rekapHarian).map(([tgl, val]) => ({
        tanggal: tgl,
        total_kalori: Math.round(val.kalori),
        total_protein: Math.round(val.protein * 10) / 10,
        total_karbohidrat: Math.round(val.karbohidrat * 10) / 10,
        total_lemak: Math.round(val.lemak * 10) / 10,
        target_kalori: 2000
      }));

      const reportData = {
        periode: periode || 'mingguan',
        startDate,
        endDate,
        total_kalori: Math.round(totalKalori),
        total_protein: Math.round(totalProtein * 10) / 10,
        total_karbohidrat: Math.round(totalKarbohidrat * 10) / 10,
        total_lemak: Math.round(totalLemak * 10) / 10,
        ringkasan: {
          total_kalori: Math.round(totalKalori),
          rata_rata_kalori: Math.round(totalKalori / hari),
          hari_tercapai: harianArray.filter(h => h.total_kalori >= 2000).length
        },
        harian: harianArray,
        rata_rata_berat: Math.round(rataBerat * 10) / 10
      };

      try {
        await LaporanAnalisis.create({
          userId,
          periode: periode || 'mingguan',
          startDate,
          endDate,
          totalKalori: Math.round(totalKalori),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalKarbohidrat: Math.round(totalKarbohidrat * 10) / 10,
          totalLemak: Math.round(totalLemak * 10) / 10,
          rataRataKalori: Math.round(totalKalori / hari),
          rataRataBerat: Math.round(rataBerat * 10) / 10,
          hariTercapai: harianArray.filter(h => h.total_kalori >= 2000).length,
          totalHari: hari,
          dataLengkap: { harian: harianArray }
        });
      } catch (saveErr) {
        console.error('Gagal menyimpan laporan:', saveErr.message);
      }

      return res.json({ success: true, data: reportData });
    } catch (error) {
      console.error('Laporan error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async getRiwayatLaporan(req, res) {
    try {
      const userId = req.userId;
      const limit = req.query.limit || 10;
      const riwayat = await LaporanAnalisis.getRiwayat(userId, limit);
      return res.json({ success: true, data: riwayat });
    } catch (error) {
      console.error('Riwayat laporan error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async cekDataTersedia(req, res) {
    try {
      const userId = req.userId;
      const { periode } = req.query;

      const today = new Date();
      let startDate;
      switch (periode) {
        case 'harian': startDate = today.toISOString().split('T')[0]; break;
        case 'mingguan': startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
        case 'bulanan': startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
        default: startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const endDate = today.toISOString().split('T')[0];
      const konsumsi = await KonsumsiHarian.getByUserAndPeriod(userId, startDate, endDate);

      const hariTercatat = konsumsi.reduce((days, item) => {
        if (!days.includes(item.tanggal)) days.push(item.tanggal);
        return days;
      }, []).length;

      const totalKalori = konsumsi.reduce((sum, item) => sum + (parseFloat(item.kalori) * item.porsi), 0);
      const rataKalori = hariTercatat > 0 ? Math.round(totalKalori / hariTercatat) : 0;

      const targetHari = periode === 'harian' ? 1 : periode === 'bulanan' ? 30 : 7;
      const cukup = hariTercatat >= targetHari;

      return res.json({
        success: true,
        data: {
          cukup,
          hari_tercatat: hariTercatat,
          hari_dibutuhkan: targetHari,
          rata_rata_kalori: rataKalori,
          total_kalori: Math.round(totalKalori),
          persentase: Math.min(100, Math.round((hariTercatat / targetHari) * 100))
        }
      });
    } catch (error) {
      console.error('Cek data error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = LaporanController;
