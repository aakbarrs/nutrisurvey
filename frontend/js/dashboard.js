const Dashboard = {
  async loadDashboard() {
    const content = document.getElementById('dashboardDataContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat data...</p></div>';

    try {
      const result = await API.get('/dashboard');
      const data = result.data || result;
      content.innerHTML = '';
      this.renderKaloriCard(data, content);
      this.renderNutrisiMakro(data.nutrisi_makro || {}, content);
      this.renderMakananList(data.makanan_hari_ini || [], content);
      if (data.berat_badan) {
        this.renderBeratBadan(data.berat_badan, content);
      }
      this.renderMingguan(data.mingguan, data.berat_badan, content);
      if (data.rekomendasi) {
        this.renderRekomendasi(data.rekomendasi, content);
      }
      this.renderGridMenu(content);
    } catch (err) {
      content.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Gagal memuat data</h3><p>' + err.message + '</p></div>';
    }
  },

  renderKaloriCard(data, content) {
    const consumed = data.kalori_terpakai || 0;
    const target = data.target_kalori || 2000;
    const remaining = Math.max(0, target - consumed);
    const pct = Math.min(100, Math.round((consumed / target) * 100));
    const circumference = 440;
    const offset = circumference - (pct / 100) * circumference;

    const section = document.createElement('div');
    section.className = 'slide-down';
    section.innerHTML = `
      <div class="section-header"><h2>&#128200; Ringkasan Hari Ini</h2></div>
      <div class="card kalori-card">
        <div class="card-header"><div class="card-icon">&#128293;</div><h3>Kalori</h3></div>
        <div class="kalori-circle">
          <svg viewBox="0 0 160 160">
            <circle class="bg" cx="80" cy="80" r="70"/>
            <circle class="progress" cx="80" cy="80" r="70" style="stroke-dashoffset: ${offset}"/>
          </svg>
          <div class="center">
            <div class="value">${consumed}</div>
            <div class="label">Kalori</div>
          </div>
        </div>
        <div class="kalori-stats">
          <div class="kalori-stat consumed">
            <div class="num">${consumed}</div>
            <div class="lbl">Dikonsumsi</div>
          </div>
          <div class="kalori-stat target">
            <div class="num">${target}</div>
            <div class="lbl">Target</div>
          </div>
          <div class="kalori-stat remaining">
            <div class="num">${remaining}</div>
            <div class="lbl">Sisa</div>
          </div>
        </div>
      </div>
    `;
    content.appendChild(section);
  },

  renderNutrisiMakro(data, content) {
    const protein = (data && data.protein) ? data.protein : { jumlah: 0, target: 60 };
    const lemak = (data && data.lemak) ? data.lemak : { jumlah: 0, target: 65 };
    const karbohidrat = (data && data.karbohidrat) ? data.karbohidrat : { jumlah: 0, target: 300 };

    const proteinPct = Math.min(100, Math.round((protein.jumlah / protein.target) * 100));
    const lemakPct = Math.min(100, Math.round((lemak.jumlah / lemak.target) * 100));
    const karboPct = Math.min(100, Math.round((karbohidrat.jumlah / karbohidrat.target) * 100));

    const section = document.createElement('div');
    section.className = 'slide-down';
    section.innerHTML = `
      <div class="section-header"><h2>Nutrisi Makro</h2></div>
      <div class="card card-blue">
        <div class="nutrisi-item">
          <div class="nutrisi-label">Protein</div>
          <div class="nutrisi-bar-wrap">
            <div class="nutrisi-bar protein" style="width: ${proteinPct}%"></div>
          </div>
          <div class="nutrisi-value">${protein.jumlah}/${protein.target}g</div>
        </div>
        <div class="nutrisi-item">
          <div class="nutrisi-label">Lemak</div>
          <div class="nutrisi-bar-wrap">
            <div class="nutrisi-bar lemak" style="width: ${lemakPct}%"></div>
          </div>
          <div class="nutrisi-value">${lemak.jumlah}/${lemak.target}g</div>
        </div>
        <div class="nutrisi-item">
          <div class="nutrisi-label">Karbohidrat</div>
          <div class="nutrisi-bar-wrap">
            <div class="nutrisi-bar karbohidrat" style="width: ${karboPct}%"></div>
          </div>
          <div class="nutrisi-value">${karbohidrat.jumlah}/${karbohidrat.target}g</div>
        </div>
      </div>
    `;
    content.appendChild(section);
  },

  renderMakananList(items, content) {
    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.15s';

    section.innerHTML = `
      <div class="section-header">
        <h2>&#127858; Makan per waktu</h2>
        <button class="section-link" onclick="App.navigate('catat-makanan')">+ Tambah</button>
      </div>
      <div class="card">
    `;

    const grouped = {};
    items.forEach(item => {
      const waktu = item.waktu_makan || 'Lainnya';
      if (!grouped[waktu]) grouped[waktu] = [];
      grouped[waktu].push(item);
    });

    const waktuOrder = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Camilan', 'Lainnya'];
    const eatIcons = { 'Sarapan': '🌅', 'Makan Siang': '☀️', 'Makan Malam': '🌙', 'Camilan': '🍿', 'Lainnya': '🍴' };

    if (!items || items.length === 0) {
      section.innerHTML += `
        <div class="list-item">
          <div class="list-icon bg-orange-light">🌅</div>
          <div class="list-content">
            <div class="title">Sarapan</div>
            <div class="subtitle">- (belum ada data)</div>
          </div>
          <div class="value" style="color:var(--text-muted);">-</div>
        </div>
        <div class="list-item">
          <div class="list-icon bg-orange-light">☀️</div>
          <div class="list-content">
            <div class="title">Siang</div>
            <div class="subtitle">- (belum ada data)</div>
          </div>
          <div class="value" style="color:var(--text-muted);">-</div>
        </div>
        <div class="list-item">
          <div class="list-icon bg-orange-light">🌙</div>
          <div class="list-content">
            <div class="title">Malam</div>
            <div class="subtitle">- (belum ada data)</div>
          </div>
          <div class="value" style="color:var(--text-muted);">-</div>
        </div>
      `;
    } else {
      waktuOrder.forEach(waktu => {
        const list = grouped[waktu];
        const totalKal = list ? list.reduce((s, i) => s + (i.kalori || 0), 0) : 0;
        const displayCal = totalKal > 0 ? totalKal + ' kcal' : '- (belum ada data)';
        const itemsHtml = list ? list.map(item => `
          <div class="list-item" style="padding-left:48px;">
            <div class="list-content">
              <div class="title" style="font-size:13px;">${item.nama_makanan || '-'}</div>
            </div>
            <div class="value orange">${item.kalori || 0}</div>
          </div>
        `).join('') : '';

        section.innerHTML += `
          <div class="list-item">
            <div class="list-icon bg-orange-light">${eatIcons[waktu] || '🍴'}</div>
            <div class="list-content">
              <div class="title">${waktu === 'Makan Siang' ? 'Siang' : waktu === 'Makan Malam' ? 'Malam' : waktu}</div>
            </div>
            <div class="value" style="${totalKal > 0 ? 'color:var(--orange);' : 'color:var(--text-muted);'}">${displayCal}</div>
          </div>
          ${itemsHtml}
        `;
      });
    }

    section.innerHTML += '</div>';
    content.appendChild(section);
  },

  renderBeratBadan(data, content) {
    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.2s';
    const bb = data.terakhir || '--';
    section.innerHTML = `
      <div class="section-header">
        <h2>&#128202; BB</h2>
        <button class="section-link" onclick="App.navigate('berat-badan')">Detail</button>
      </div>
      <div class="card">
        <div style="text-align:center;padding:8px 0;">
          <div style="font-size:36px;font-weight:800;color:var(--blue);">${bb}</div>
          <div style="font-size:14px;color:var(--text-light);">kg</div>
        </div>
        <div style="width:100%;height:120px;background:linear-gradient(180deg,rgba(255,107,53,0.08) 0%,rgba(255,107,53,0.02) 100%);border-radius:var(--radius-sm);display:flex;align-items:flex-end;padding:12px 8px;gap:6px;">
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:60%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:75%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:55%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:80%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:70%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:85%;opacity:0.6;"></div>
          <div style="flex:1;border-radius:3px 3px 0 0;background:var(--orange);min-height:8px;height:65%;opacity:0.6;"></div>
        </div>
      </div>
    `;
    content.appendChild(section);
  },

  renderMingguan(data, beratData, content) {
    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.05s';
    const hariTercatat = data ? data.filter(d => d.has_data).length : 0;
    const perubahan = beratData ? (beratData.selisih || 0) : 0;
    const trend = perubahan > 0 ? (perubahan + ' kg Turun') : perubahan < 0 ? (Math.abs(perubahan) + ' kg Naik') : '-';
    section.innerHTML = `
      <div class="section-header"><h2>Minggu Ini</h2></div>
      <div class="card">
        <div style="display:flex;justify-content:space-around;padding:12px 0;">
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:700;color:var(--green);">&#10003; ${hariTercatat}/7 hari</div>
            <div style="font-size:12px;color:var(--text-light);">Tercatat</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:700;color:var(--orange);">&#8776; ${trend}</div>
            <div style="font-size:12px;color:var(--text-light);">Perubahan BB</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:700;color:var(--blue);">&#128293; ${hariTercatat} hari</div>
            <div style="font-size:12px;color:var(--text-light);">Aktif</div>
          </div>
        </div>
      </div>
    `;
    content.appendChild(section);
  },

  renderRekomendasi(data, content) {
    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.25s';
    section.innerHTML = `
      <div class="section-header">
        <h2>&#10024; Rekomendasi</h2>
      </div>
      <div class="rekomendasi-card">
        <div class="rek-icon">${data.icon || '🥗'}</div>
        <div class="rek-title">${data.judul || 'Ikan Bakar + Sayur (420 kcal) Cocok dengan sisa kalori'}</div>
        <div class="rek-desc">${data.deskripsi || ''}</div>
        <button class="rek-btn" onclick="App.navigate('rekomendasi')">Lihat &#8594;</button>
      </div>
    `;
    content.appendChild(section);
  },

  renderGridMenu(content) {
    const section = document.createElement('div');
    section.className = 'slide-down';
    section.style.animationDelay = '0.1s';
    section.innerHTML = `
      <div class="section-header"><h2>Menu Utama</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div class="card" style="text-align:center;padding:20px;cursor:pointer;" onclick="App.navigate('catat-makanan')">
          <div style="font-size:32px;margin-bottom:8px;">&#127858;</div>
          <div style="font-size:14px;font-weight:600;">Catat Makanan</div>
        </div>
        <div class="card" style="text-align:center;padding:20px;cursor:pointer;" onclick="App.navigate('berat-badan')">
          <div style="font-size:32px;margin-bottom:8px;">&#9878;&#65039;</div>
          <div style="font-size:14px;font-weight:600;">Update Berat</div>
        </div>
        <div class="card" style="text-align:center;padding:20px;cursor:pointer;" onclick="App.navigate('analisis')">
          <div style="font-size:32px;margin-bottom:8px;">&#128202;</div>
          <div style="font-size:14px;font-weight:600;">Laporan Analisis</div>
        </div>
      </div>
      <div class="section-header"><h2>Menu Navigasi Bawah</h2></div>
      <nav class="bottom-nav" style="position:relative;bottom:auto;left:auto;right:auto;width:100%;border-radius:var(--radius);">
        <button class="nav-item active" onclick="App.navigate('dashboard-data')">
          <span class="nav-icon">&#127968;</span>
          <span>Beranda</span>
        </button>
        <button class="nav-item" onclick="App.navigate('riwayat')">
          <span class="nav-icon">&#128203;</span>
          <span>Riwayat</span>
        </button>
        <button class="nav-item" onclick="App.navigate('profil')">
          <span class="nav-icon">&#128100;</span>
          <span>Profil</span>
        </button>
      </nav>
    `;
    content.appendChild(section);
  },

  renderEmptyState(title, desc, btnText, navTarget) {
    return `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">&#128203;</div>
          <h3>${title}</h3>
          <p>${desc}</p>
          ${btnText ? '<button class="btn btn-primary" onclick="App.navigate(\'' + navTarget + '\')">' + btnText + '</button>' : ''}
        </div>
      </div>
    `;
  },

  async hapusKonsumsi(id) {
    if (!confirm('Hapus catatan makanan ini?')) return;
    try {
      await API.delete('/konsumsi/' + id);
      App.showToast('Catatan berhasil dihapus', 'success');
      this.loadDashboard();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  }
};
