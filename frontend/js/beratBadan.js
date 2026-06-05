const BeratBadan = {
  beratData: [],
  chartCanvas: null,

  async showPemantauan() {
    App.navigate('berat-badan');
    const content = document.getElementById('beratBadanContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat data berat badan...</p></div>';

    try {
      const data = await API.get('/berat-badan/riwayat');
      const records = data.data || data.berat_badan || data || [];
      this.beratData = Array.isArray(records) ? records : [];

      content.innerHTML = '';

      const headerSection = document.createElement('div');
      headerSection.className = 'slide-down';
      headerSection.innerHTML = `
        <div class="section-header">
          <h2>⚖️ Pemantauan Berat Badan</h2>
        </div>
        <button class="btn btn-primary" onclick="BeratBadan.showCatatBerat()">Catat Berat Badan</button>
        <div style="height:16px;"></div>
      `;
      content.appendChild(headerSection);

      if (this.beratData.length > 0) {
        const stats = this.calculateStats(this.beratData);
        const statsSection = document.createElement('div');
        statsSection.className = 'card slide-down';
        statsSection.style.animationDelay = '0.1s';
        statsSection.innerHTML = `
          <div class="berat-ringkasan">
            <div class="item">
              <div class="num blue">${stats.terakhir}</div>
              <div class="lbl">Terakhir (kg)</div>
            </div>
            <div class="item">
              <div class="num blue">${stats.rataRata}</div>
              <div class="lbl">Rata-rata (kg)</div>
            </div>
            <div class="item">
              <div class="num ${stats.selisih >= 0 ? 'green' : 'red'}">${stats.selisih >= 0 ? '+' : ''}${stats.selisih}</div>
              <div class="lbl">${stats.selisih >= 0 ? 'Naik' : 'Turun'} (kg)</div>
            </div>
          </div>
        `;
        content.appendChild(statsSection);

        const chartSection = document.createElement('div');
        chartSection.className = 'card slide-down';
        chartSection.style.animationDelay = '0.15s';
        chartSection.innerHTML = `
          <div class="card-header">
            <h3>📈 Grafik Berat Badan</h3>
          </div>
          <div class="chart-container">
            <canvas id="beratChart"></canvas>
          </div>
        `;
        content.appendChild(chartSection);

        setTimeout(() => {
          this.renderGrafik(this.beratData);
        }, 100);

        const riwayatSection = document.createElement('div');
        riwayatSection.className = 'slide-down';
        riwayatSection.style.animationDelay = '0.2s';
        riwayatSection.innerHTML = '<div class="section-header"><h2>Riwayat</h2></div>';

        this.beratData.slice(0, 14).forEach(record => {
          const item = document.createElement('div');
          item.className = 'list-item';
          const tgl = record.tanggal || record.created_at || '';
          const displayDate = tgl ? new Date(tgl).toLocaleDateString('id-ID') : '-';
          item.innerHTML = `
            <div class="list-icon bg-blue-light">⚖️</div>
            <div class="list-content">
              <div class="title">${record.berat} kg</div>
              <div class="subtitle">${displayDate}</div>
            </div>
            <div class="list-end">
              ${record.catatan ? `<div class="sub">${record.catatan}</div>` : ''}
            </div>
          `;
          riwayatSection.appendChild(item);
        });

        content.appendChild(riwayatSection);

        if (this.beratData.length >= 14) {
          const moreBtn = document.createElement('button');
          moreBtn.className = 'btn btn-secondary';
          moreBtn.textContent = 'Muat lebih banyak';
          moreBtn.style.marginTop = '8px';
          moreBtn.onclick = () => this.loadMoreRiwayat();
          content.appendChild(moreBtn);
        }
      } else {
        const emptySection = document.createElement('div');
        emptySection.className = 'slide-down';
        emptySection.style.animationDelay = '0.1s';
        emptySection.innerHTML = `
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon">⚖️</div>
              <h3>Belum Ada Data</h3>
              <p>Mulai catat berat badan Anda untuk melihat grafik perkembangan</p>
            </div>
          </div>
        `;
        content.appendChild(emptySection);
      }
    } catch (err) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Gagal memuat data</h3>
          <p>${err.message}</p>
          <button class="btn btn-primary" onclick="BeratBadan.showPemantauan()">Coba Lagi</button>
        </div>
      `;
    }
  },

  calculateStats(data) {
    if (!data || data.length === 0) {
      return { terakhir: '-', rataRata: '-', selisih: 0 };
    }
    const sorted = [...data].sort((a, b) => new Date(b.tanggal || b.created_at || 0) - new Date(a.tanggal || a.created_at || 0));
    const terakhir = sorted[0].berat;
    const rataRata = (data.reduce((sum, r) => sum + (r.berat || 0), 0) / data.length).toFixed(1);
    const first = sorted[sorted.length - 1].berat;
    const selisih = (terakhir - first).toFixed(1);
    return { terakhir, rataRata: parseFloat(rataRata), selisih: parseFloat(selisih) };
  },

  showCatatBerat() {
    App.navigate('catat-berat');
    const content = document.getElementById('catatBeratContent');
    if (!content) return;

    const today = new Date().toISOString().split('T')[0];

    content.innerHTML = `
      <div class="card card-blue">
        <div class="card-header">
          <h3>⚖️ Catat Berat Badan</h3>
        </div>
        <div class="card-body">
          Masukkan berat badan terbaru Anda
        </div>
      </div>
      <form id="beratForm">
        <div class="form-group">
          <label>Berat Badan (kg)</label>
          <input class="form-input" id="beratInput" type="number" placeholder="Contoh: 65.5" step="0.1" min="1" max="500" required autofocus>
        </div>
        <div class="form-group">
          <label>Tanggal</label>
          <input class="form-input" id="beratTanggal" type="date" value="${today}" required>
        </div>
        <div class="form-group">
          <label>Catatan (opsional)</label>
          <input class="form-input" id="beratCatatan" type="text" placeholder="Contoh: Setelah olahraga pagi">
        </div>
        <div id="beratError" class="alert alert-error" style="display:none"></div>
        <button type="submit" class="btn btn-primary" id="beratSimpanBtn">Simpan</button>
      </form>
    `;

    const form = document.getElementById('beratForm');
    const errorDiv = document.getElementById('beratError');
    const btn = document.getElementById('beratSimpanBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const berat = parseFloat(document.getElementById('beratInput').value);
        const tanggal = document.getElementById('beratTanggal').value;
        const catatan = document.getElementById('beratCatatan').value.trim();

        if (!berat || berat <= 0) {
          if (errorDiv) { errorDiv.style.display = 'flex'; errorDiv.innerHTML = '<span class="alert-icon">⚠️</span><span>Masukkan berat badan yang valid</span>'; }
          return;
        }
        if (!tanggal) {
          if (errorDiv) { errorDiv.style.display = 'flex'; errorDiv.innerHTML = '<span class="alert-icon">⚠️</span><span>Pilih tanggal</span>'; }
          return;
        }

        this.simpanKonfirmasi({ berat, tanggal, catatan });
      });
    }
  },

  simpanKonfirmasi(data) {
    App.navigate('konfirmasi-berat');
    const content = document.getElementById('konfirmasiBeratContent');
    if (!content) return;

    const tgl = new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    content.innerHTML = `
      <div class="card card-blue">
        <div class="card-header">
          <h3>🔍 Konfirmasi</h3>
        </div>
        <div class="nutrisi-detail" style="margin:0;">
          <div class="nutrisi-row">
            <span class="lbl">Berat Badan</span>
            <span class="val" style="font-size:18px;">${data.berat} kg</span>
          </div>
          <div class="nutrisi-row">
            <span class="lbl">Tanggal</span>
            <span class="val">${tgl}</span>
          </div>
          ${data.catatan ? `<div class="nutrisi-row"><span class="lbl">Catatan</span><span class="val">${data.catatan}</span></div>` : ''}
        </div>
      </div>
      <div id="konfirmasiBeratError" class="alert alert-error" style="display:none"></div>
      <div class="btn-group">
        <button class="btn btn-secondary" onclick="BeratBadan.showCatatBerat()">Kembali</button>
        <button class="btn btn-success" id="konfirmasiBeratBtn" onclick="BeratBadan.simpanBerat()">Konfirmasi & Simpan</button>
      </div>
    `;

    this.pendingData = data;
  },

  async simpanBerat() {
    if (!this.pendingData) return;

    const btn = document.getElementById('konfirmasiBeratBtn');
    const errorDiv = document.getElementById('konfirmasiBeratError');

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
      if (errorDiv) errorDiv.style.display = 'none';

      const result = await API.post('/berat-badan/simpan', this.pendingData);
      this.showSukses(result.data || result);
    } catch (err) {
      if (errorDiv) {
        errorDiv.style.display = 'flex';
        errorDiv.innerHTML = `<span class="alert-icon">⚠️</span><span>${err.message}</span>`;
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Konfirmasi & Simpan'; }
    }
  },

  showSukses(data) {
    App.navigate('berat-tersimpan');
    const content = document.getElementById('beratTersimpanContent');
    if (!content) return;

    content.innerHTML = `
      <div class="success-page">
        <div class="success-icon">✓</div>
        <h2>Berat Badan Tersimpan! 🎉</h2>
        <p>Data berat badan ${data.berat || this.pendingData?.berat} kg telah berhasil disimpan.</p>
        <div class="card" style="text-align:left;">
          <div class="nutrisi-detail" style="margin:0;">
            <div class="nutrisi-row">
              <span class="lbl">Berat</span>
              <span class="val blue">${data.berat || this.pendingData?.berat} kg</span>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <button class="btn btn-primary" onclick="BeratBadan.showPemantauan()">Lihat Grafik</button>
          <button class="btn btn-outline" onclick="BeratBadan.showCatatBerat()">Catat Lagi</button>
        </div>
      </div>
    `;

    this.pendingData = null;
  },

  showError(msg) {
    App.showToast(msg, 'error');
  },

  renderGrafik(data) {
    const canvas = document.getElementById('beratChart');
    if (!canvas || !data || data.length < 2) return;

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
    const pad = { top: 20, right: 16, bottom: 30, left: 40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const sorted = [...data].sort((a, b) => new Date(a.tanggal || a.created_at || 0) - new Date(b.tanggal || b.created_at || 0));
    const values = sorted.map(r => r.berat);
    const min = Math.floor(Math.min(...values) - 1);
    const max = Math.ceil(Math.max(...values) + 1);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#9E9E9E';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const val = max - (range / gridLines) * i;
      ctx.fillText(Math.round(val * 10) / 10, pad.left - 6, y);
    }
    ctx.setLineDash([]);

    const gap = chartW / (sorted.length - 1 || 1);
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, 'rgba(255,107,53,0.2)');
    gradient.addColorStop(1, 'rgba(255,107,53,0.01)');

    ctx.beginPath();
    sorted.forEach((r, i) => {
      const x = pad.left + gap * i;
      const y = pad.top + chartH - ((r.berat - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastX = pad.left + gap * (sorted.length - 1);
    const lastY = pad.top + chartH - ((sorted[sorted.length - 1].berat - min) / range) * chartH;
    ctx.lineTo(lastX, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    sorted.forEach((r, i) => {
      const x = pad.left + gap * i;
      const y = pad.top + chartH - ((r.berat - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    sorted.forEach((r, i) => {
      const x = pad.left + gap * i;
      const y = pad.top + chartH - ((r.berat - min) / range) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = '#9E9E9E';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(sorted.length / 6));
    sorted.forEach((r, i) => {
      if (i % step !== 0 && i !== sorted.length - 1) return;
      const x = pad.left + gap * i;
      const d = new Date(r.tanggal || r.created_at || 0);
      ctx.fillText(`${d.getDate()}/${d.getMonth() + 1}`, x, pad.top + chartH + 4);
    });
  }
};
