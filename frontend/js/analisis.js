const Analisis = {
  selectedPeriode: 'mingguan',
  reportData: null,

  showLaporanAnalisis() {
    App.navigate('analisis');
    const content = document.getElementById('analisisContent');
    if (!content) return;

    content.innerHTML = `
      <div class="slide-down">
        <div class="section-header">
          <h2>📊 Analisis Nutrisi</h2>
        </div>
        <div class="card card-green">
          <div class="card-header">
            <h3>📈 Laporan Nutrisi</h3>
          </div>
          <div class="card-body">
            Lihat laporan konsumsi nutrisi harian, mingguan, atau bulanan Anda
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3>Pilih Periode</h3>
          </div>
          <div class="card-body">
            <div class="radio-group" id="periodeGroup">
              <label class="radio-item">
                <input type="radio" name="periode" value="harian">
                <span class="radio-indicator"></span>
                <span class="radio-label">Harian</span>
              </label>
              <label class="radio-item">
                <input type="radio" name="periode" value="mingguan" checked>
                <span class="radio-indicator"></span>
                <span class="radio-label">Mingguan (7 hari terakhir)</span>
              </label>
              <label class="radio-item">
                <input type="radio" name="periode" value="bulanan">
                <span class="radio-indicator"></span>
                <span class="radio-label">Bulanan (30 hari terakhir)</span>
              </label>
            </div>
            <div style="height:12px;"></div>
            <button class="btn btn-primary" onclick="Analisis.pilihPeriode()">Lihat Laporan</button>
          </div>
        </div>
        <div id="laporanHasil"></div>
      </div>
    `;
  },

  pilihPeriode(periode) {
    if (periode) {
      this.selectedPeriode = periode;
    } else {
      const selected = document.querySelector('input[name="periode"]:checked');
      this.selectedPeriode = selected ? selected.value : 'mingguan';
    }
    App.navigate('loading-analisis');
  },

  showLoading() {
    const hasil = document.getElementById('laporanHasil');
    if (hasil) {
      hasil.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Menganalisis data...</p></div>';
    }
  },

  async generateLaporan(periode) {
    try {
      const data = await API.get(`/laporan?periode=${periode}`);
      this.reportData = data.data || data;

      const hasil = document.getElementById('laporanHasil');
      if (!hasil) return;

      if (!this.reportData || (Array.isArray(this.reportData) && this.reportData.length === 0) || (!Array.isArray(this.reportData) && !this.reportData.total_kalori && !this.reportData.harian)) {
        this.showDataBelumCukup();
        return;
      }

      if (periode === 'harian') {
        this.showLaporanHarian(this.reportData);
      } else if (periode === 'mingguan') {
        this.showLaporan7Hari(this.reportData);
      } else {
        this.showLaporanBulanan(this.reportData);
      }

      const exportSection = document.createElement('div');
      exportSection.className = 'slide-down';
      exportSection.style.animationDelay = '0.3s';
      exportSection.innerHTML = `
        <div style="margin-top:16px;">
          <button class="btn btn-outline" onclick="Analisis.exportPDF()" style="width:100%;">
            📄 Export Laporan (PDF)
          </button>
        </div>
      `;
      hasil.appendChild(exportSection);
    } catch (err) {
      const hasil = document.getElementById('laporanHasil');
      if (hasil) {
        hasil.innerHTML = `
          <div class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>${err.message}</span>
          </div>
        `;
      }
    }
  },

  showLaporanHarian(data) {
    const hasil = document.getElementById('laporanHasil');
    if (!hasil) return;

    const kalori = data.total_kalori || data.kalori || 0;
    const target = data.target_kalori || 2000;
    const pct = Math.min(100, Math.round((kalori / target) * 100));

    const nutrisi = data.nutrisi_makro || data;
    const protein = nutrisi.protein || nutrisi.total_protein || 0;
    const lemak = nutrisi.lemak || nutrisi.total_lemak || 0;
    const karbo = nutrisi.karbohidrat || nutrisi.total_karbohidrat || 0;

    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.1s';
    section.innerHTML = `
      <div class="section-header">
        <h2>📋 Laporan Harian</h2>
        <span class="badge badge-blue">Hari Ini</span>
      </div>
      <div class="card card-orange">
        <div class="card-header"><h3>🔥 Kalori</h3></div>
        <div class="progress-label">
          <span>${kalori} kal terkonsumsi</span>
          <span>${pct}% dari ${target}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill orange" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="card card-blue">
        <div class="card-header"><h3>🥩 Nutrisi Makro</h3></div>
        <div class="progress-label"><span>Protein</span><span>${protein}g</span></div>
        <div class="progress-bar" style="margin-bottom:10px;">
          <div class="progress-fill blue" style="width:${Math.min(100, (protein / 60) * 100)}%"></div>
        </div>
        <div class="progress-label"><span>Lemak</span><span>${lemak}g</span></div>
        <div class="progress-bar" style="margin-bottom:10px;">
          <div class="progress-fill yellow" style="width:${Math.min(100, (lemak / 65) * 100)}%"></div>
        </div>
        <div class="progress-label"><span>Karbohidrat</span><span>${karbo}g</span></div>
        <div class="progress-bar">
          <div class="progress-fill orange" style="width:${Math.min(100, (karbo / 300) * 100)}%"></div>
        </div>
      </div>
    `;
    hasil.appendChild(section);
  },

  showLaporan7Hari(data) {
    const hasil = document.getElementById('laporanHasil');
    if (!hasil) return;

    const harian = data.harian || data.hari || data;
    const ringkasan = data.ringkasan || data;

    let entries = [];
    if (Array.isArray(harian)) {
      entries = harian;
    } else if (typeof harian === 'object') {
      entries = Object.values(harian);
    }

    const avgKalori = ringkasan.rata_rata_kalori || entries.reduce((s, e) => s + (e.total_kalori || e.kalori || 0), 0) / (entries.length || 1);
    const totalKalori = ringkasan.total_kalori || entries.reduce((s, e) => s + (e.total_kalori || e.kalori || 0), 0);

    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.1s';
    section.innerHTML = `
      <div class="section-header">
        <h2>📋 Laporan 7 Hari</h2>
        <span class="badge badge-green">${entries.length} hari</span>
      </div>
      <div class="card card-green">
        <div class="card-header"><h3>📊 Ringkasan</h3></div>
        <div class="berat-ringkasan">
          <div class="item">
            <div class="num orange">${Math.round(totalKalori)}</div>
            <div class="lbl">Total Kalori</div>
          </div>
          <div class="item">
            <div class="num blue">${Math.round(avgKalori)}</div>
            <div class="lbl">Rata-rata/hari</div>
          </div>
          <div class="item">
            <div class="num green">${ringkasan.hari_tercapai || entries.filter(e => (e.total_kalori || e.kalori || 0) >= (e.target_kalori || 0.7 * 2000)).length || '-'}</div>
            <div class="lbl">Hari Tercapai</div>
          </div>
        </div>
      </div>
    `;
    hasil.appendChild(section);

    const chartSection = document.createElement('div');
    chartSection.className = 'card slide-down';
    chartSection.style.animationDelay = '0.15s';
    chartSection.innerHTML = `
      <div class="card-header">
        <h3>📈 Kalori per Hari</h3>
      </div>
      <div class="chart-container" style="height:180px;">
        <canvas id="analisisBarChart"></canvas>
      </div>
    `;
    hasil.appendChild(chartSection);

    setTimeout(() => {
      this.renderBarChart(entries);
    }, 100);
  },

  showLaporanBulanan(data) {
    const hasil = document.getElementById('laporanHasil');
    if (!hasil) return;

    const harian = data.harian || data.hari || data;
    let entries = [];
    if (Array.isArray(harian)) {
      entries = harian;
    } else if (typeof harian === 'object') {
      entries = Object.values(harian);
    }

    const ringkasan = data.ringkasan || data;
    const avgKalori = ringkasan.rata_rata_kalori || entries.reduce((s, e) => s + (e.total_kalori || e.kalori || 0), 0) / (entries.length || 1);
    const totalKalori = ringkasan.total_kalori || entries.reduce((s, e) => s + (e.total_kalori || e.kalori || 0), 0);

    const section = document.createElement('div');
    section.className = 'slide-down';
    section.innerHTML = `
      <div class="section-header">
        <h2>📋 Laporan Bulanan</h2>
        <span class="badge badge-green">${entries.length} hari</span>
      </div>
      <div class="card card-green">
        <div class="card-header"><h3>📊 Ringkasan</h3></div>
        <div class="berat-ringkasan">
          <div class="item">
            <div class="num orange">${Math.round(totalKalori)}</div>
            <div class="lbl">Total Kalori</div>
          </div>
          <div class="item">
            <div class="num blue">${Math.round(avgKalori)}</div>
            <div class="lbl">Rata-rata/hari</div>
          </div>
          <div class="item">
            <div class="num green">${ringkasan.hari_tercapai || '-'}</div>
            <div class="lbl">Hari Tercapai</div>
          </div>
        </div>
      </div>
    `;
    hasil.appendChild(section);
  },

  showDataBelumCukup() {
    const hasil = document.getElementById('laporanHasil');
    if (!hasil) return;

    hasil.innerHTML = `
      <div class="card slide-down">
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>Data Belum Cukup</h3>
          <p>Catat konsumsi makanan Anda secara rutin untuk melihat analisis dan laporan nutrisi yang lebih akurat.</p>
          <button class="btn btn-primary" onclick="App.navigate('catat-makanan')">Catat Makanan</button>
        </div>
      </div>
    `;
  },

  renderBarChart(entries) {
    const canvas = document.getElementById('analisisBarChart');
    if (!canvas || !entries || entries.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 12, bottom: 28, left: 36 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const sorted = [...entries].sort((a, b) => {
      const da = new Date(a.tanggal || a.created_at || 0);
      const db = new Date(b.tanggal || b.created_at || 0);
      return da - db;
    });

    const values = sorted.map(e => e.total_kalori || e.kalori || 0);
    const maxVal = Math.max(...values, 100) * 1.15;
    const barW = Math.min(32, (chartW / sorted.length) * 0.6);
    const gap = chartW / sorted.length;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((maxVal / gridLines) * (gridLines - i)), pad.left - 4, y);
    }
    ctx.setLineDash([]);

    const targetLine = 2000;
    if (targetLine < maxVal) {
      const targetY = pad.top + chartH - (targetLine / maxVal) * chartH;
      ctx.strokeStyle = '#FF4757';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, targetY);
      ctx.lineTo(w - pad.right, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FF4757';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Target', w - pad.right - 4, targetY - 2);
    }

    sorted.forEach((entry, i) => {
      const val = entry.total_kalori || entry.kalori || 0;
      const barH = (val / maxVal) * chartH;
      const x = pad.left + gap * i + (gap - barW) / 2;
      const y = pad.top + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, pad.top + chartH);
      grad.addColorStop(0, '#FF6B35');
      grad.addColorStop(1, '#FF8F5E');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#FF6B35';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      if (barH > 20) {
        ctx.fillText(Math.round(val), x + barW / 2, y - 2);
      }

      ctx.fillStyle = '#9E9E9E';
      ctx.font = '8px sans-serif';
      ctx.textBaseline = 'top';
      const d = new Date(entry.tanggal || entry.created_at || 0);
      const lbl = `${d.getDate()}/${d.getMonth() + 1}`;
      ctx.fillText(lbl, x + barW / 2, pad.top + chartH + 4);
    });
  },

  showWarning() {
  },

  startLoading() {
    var self = this;
    var periode = this.selectedPeriode || 'mingguan';
    var navigated = false;

    API.get('/laporan/cek-data?periode=' + periode).then(function(resp) {
      if (resp && resp.success && resp.data) {
        self.reportData = resp.data;
        if (!navigated) {
          navigated = true;
          setTimeout(function() {
            if (typeof App !== 'undefined') {
              if (resp.data.cukup) {
                App.navigate('laporan-7hari');
              } else {
                App.navigate('hasil-analisis-warning');
              }
            }
          }, 2000);
        }
      }
    }).catch(function() {
      if (!navigated) {
        navigated = true;
        setTimeout(function() {
          if (typeof App !== 'undefined') {
            App.navigate('laporan-7hari');
          }
        }, 2500);
      }
    });

    setTimeout(function() {
      if (!navigated && typeof App !== 'undefined') {
        navigated = true;
        App.navigate('laporan-7hari');
      }
    }, 3000);
  },

  exportPDF() {
    App.showToast('Menyiapkan data untuk export PDF...', 'success');

    const data = this.reportData;
    if (!data) {
      App.showToast('Tidak ada data untuk di-export', 'warning');
      return;
    }

    try {
      const exportData = {
        periode: this.selectedPeriode,
        tanggal: new Date().toISOString(),
        data: data
      };
      localStorage.setItem('nutrisurvey_export_data', JSON.stringify(exportData));
      window.open('/export-pdf.html', '_blank');
    } catch (err) {
      App.showToast('Gagal menyiapkan data export: ' + err.message, 'error');
    }
  }
};
