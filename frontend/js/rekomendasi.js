const Rekomendasi = {
  async showRekomendasi() {
    App.navigate('rekomendasi');
    const content = document.getElementById('rekomendasiContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat rekomendasi...</p></div>';

    try {
      const res = await API.get('/rekomendasi');
      const data = res.data || res;
      const menus = data.rekomendasi || data.menus || (Array.isArray(data) ? data : null);
      const preferensiAktif = data.preferensi_aktif || 'semua';
      const sisaKalori = data.sisaKalori || 0;
      const targetKalori = data.targetKalori || 2000;
      const kaloriTerpakai = data.kalori_terpakai || 0;

      content.innerHTML = '';
      const section = document.createElement('div');

      const prefLabels = {
        'semua': { icon: '🍽️', label: 'Semua Makanan', desc: 'Semua menu tersedia untuk Anda' },
        'vegetarian': { icon: '🥬', label: 'Vegetarian', desc: 'Hanya menu tanpa daging & ikan' },
        'vegan': { icon: '🌱', label: 'Vegan', desc: 'Hanya menu nabati (tanpa hewani)' },
        'rendah_karbo': { icon: '🥩', label: 'Rendah Karbohidrat', desc: 'Menu dengan karbohidrat ≤ 20g per porsi' },
        'tinggi_protein': { icon: '💪', label: 'Tinggi Protein', desc: 'Menu dengan protein ≥ 20g per porsi' }
      };
      const prefInfo = prefLabels[preferensiAktif] || prefLabels['semua'];

      const filterBanner = document.createElement('div');
      filterBanner.className = 'slide-down';
      filterBanner.style.marginBottom = '16px';
      filterBanner.innerHTML = `
        <div style="background:linear-gradient(135deg,#E8F5E9,#F1F8E9);border-radius:var(--radius);padding:14px 16px;border-left:4px solid var(--green);display:flex;align-items:center;gap:12px;">
          <div style="font-size:28px;">${prefInfo.icon}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--green);">Filter Aktif: ${prefInfo.label}</div>
            <div style="font-size:12px;color:var(--text-light);margin-top:2px;">${prefInfo.desc}</div>
          </div>
          <button class="btn btn-sm btn-outline" style="margin-left:auto;flex-shrink:0;" onclick="Rekomendasi.showPreferensi()">Ubah</button>
        </div>
      `;
      content.appendChild(filterBanner);

      // Calorie summary bar
      const calBar = document.createElement('div');
      calBar.className = 'slide-down';
      calBar.style.marginBottom = '16px';
      const calPct = targetKalori > 0 ? Math.min(100, Math.round((kaloriTerpakai / targetKalori) * 100)) : 0;
      const calColor = calPct > 100 ? 'var(--red)' : calPct > 85 ? 'var(--orange)' : 'var(--green)';
      calBar.innerHTML = `
        <div class="card" style="padding:12px 16px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
            <span>🔥 <strong>${kaloriTerpakai}</strong> / ${targetKalori} kal</span>
            <span style="color:${calColor};font-weight:700;">${sisaKalori >= 0 ? 'Sisa '+sisaKalori+' kal' : 'Kelebihan '+Math.abs(sisaKalori)+' kal'}</span>
          </div>
          <div class="progress-bar" style="height:6px;">
            <div class="progress-fill" style="width:${Math.min(100, calPct)}%;background:${calColor};"></div>
          </div>
        </div>
      `;
      content.appendChild(calBar);
      content.__prefAktif = preferensiAktif;

      if (menus && Array.isArray(menus) && menus.length > 0) {
        this.showMenuRekomendasi(menus, section);
      } else {
        section.innerHTML = this.renderEmptyRekomendasi();
      }

      const prefSection = document.createElement('div');
      prefSection.className = 'slide-down';
      prefSection.style.animationDelay = '0.2s';
      prefSection.innerHTML = `
        <div class="section-header">
          <h2>⚙️ Preferensi</h2>
        </div>
        <button class="btn btn-outline" onclick="Rekomendasi.showPreferensi()">Atur Preferensi Makanan</button>
      `;
      content.appendChild(section);
      content.appendChild(prefSection);
    } catch (err) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💡</div>
          <h3>Rekomendasi</h3>
          <p>${err.message}</p>
          <button class="btn btn-primary" onclick="Rekomendasi.showPreferensi()">Atur Preferensi</button>
        </div>
      `;
    }
  },

  renderEmptyRekomendasi() {
    const prefMakan = document.querySelector('#prefMakanGroup input:checked');
    const prefLabel = prefMakan ? prefMakan.value : 'saat ini';
    return `
      <div class="rekomendasi-card">
        <div class="rek-icon">🔍</div>
        <div class="rek-title">Tidak Ada Menu Sesuai Filter</div>
        <div class="rek-desc">Tidak ada menu yang cocok dengan preferensi "${prefLabel}". Coba ubah preferensi atau atur ulang filter.</div>
        <button class="rek-btn" onclick="Rekomendasi.showPreferensi()">Ubah Preferensi</button>
      </div>
    `;
  },

  showPreferensi() {
    App.navigate('preferensi');
    const content = document.getElementById('preferensiContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat preferensi...</p></div>';

    API.get('/rekomendasi/preferensi').then(data => {
      const pref = data.data || data.preferensi || data;
      content.innerHTML = '';

      if (pref && pref.id) {
        this.showAturPreferensi(pref);
      } else {
        this.showAturPreferensi(null);
      }
    }).catch(() => {
      content.innerHTML = '';
      this.showAturPreferensi(null);
    });
  },

  showAturPreferensi(existingPref) {
    const content = document.getElementById('preferensiContent');
    if (!content) return;

    const pref = existingPref || {};

    content.innerHTML = `
      <div class="card card-green">
        <div class="card-header">
          <h3>🎯 Preferensi Makanan</h3>
        </div>
        <div class="card-body">
          Atur preferensi untuk mendapatkan rekomendasi menu yang sesuai dengan kebutuhan Anda
        </div>
      </div>
      <form id="preferensiForm">
        <div class="form-group">
          <label>Tujuan Diet</label>
          <select class="form-select" id="prefTujuan">
            <option value="turun" ${pref.tujuan === 'turun' ? 'selected' : ''}>Menurunkan Berat Badan</option>
            <option value="jaga" ${pref.tujuan === 'jaga' || !pref.tujuan ? 'selected' : ''}>Menjaga Berat Badan</option>
            <option value="naik" ${pref.tujuan === 'naik' ? 'selected' : ''}>Menaikkan Berat Badan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Preferensi Makan (pilih salah satu)</label>
          <div class="radio-group" id="prefMakanGroup">
            <label class="radio-item">
              <input type="radio" name="prefMakan" value="semua" ${pref.preferensi_makan === 'semua' || !pref.preferensi_makan ? 'checked' : ''}>
              <span class="radio-indicator"></span>
              <span class="radio-label">Semua (Tidak ada pantangan)</span>
            </label>
            <label class="radio-item">
              <input type="radio" name="prefMakan" value="vegetarian" ${pref.preferensi_makan === 'vegetarian' ? 'checked' : ''}>
              <span class="radio-indicator"></span>
              <span class="radio-label">Vegetarian</span>
            </label>
            <label class="radio-item">
              <input type="radio" name="prefMakan" value="vegan" ${pref.preferensi_makan === 'vegan' ? 'checked' : ''}>
              <span class="radio-indicator"></span>
              <span class="radio-label">Vegan</span>
            </label>
            <label class="radio-item">
              <input type="radio" name="prefMakan" value="rendah_karbo" ${pref.preferensi_makan === 'rendah_karbo' ? 'checked' : ''}>
              <span class="radio-indicator"></span>
              <span class="radio-label">Rendah Karbohidrat</span>
            </label>
            <label class="radio-item">
              <input type="radio" name="prefMakan" value="tinggi_protein" ${pref.preferensi_makan === 'tinggi_protein' ? 'checked' : ''}>
              <span class="radio-indicator"></span>
              <span class="radio-label">Tinggi Protein</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Target Kalori Harian</label>
          <input class="form-input" id="prefTargetKalori" type="number" min="500" max="5000" step="50" value="${pref.target_kalori || 2000}">
          <div class="hint">Kebutuhan kalori harian Anda (500 - 5000 kal)</div>
        </div>
        <div class="form-group">
          <label>Alergi / Pantangan (pisahkan dengan koma)</label>
          <input class="form-input" id="prefAlergi" type="text" placeholder="Contoh: kacang, seafood, susu" value="${pref.alergi || ''}">
          <div class="hint">Kosongkan jika tidak ada pantangan</div>
        </div>
        <div class="form-group">
          <label>Jumlah Makan per Hari</label>
          <select class="form-select" id="prefJumlahMakan">
            <option value="3" ${(pref.jumlah_makan || 3) == 3 ? 'selected' : ''}>3 kali (Sarapan, Siang, Malam)</option>
            <option value="4" ${(pref.jumlah_makan || 3) == 4 ? 'selected' : ''}>4 kali (+ Camilan)</option>
            <option value="5" ${(pref.jumlah_makan || 3) == 5 ? 'selected' : ''}>5 kali (+ Camilan pagi & sore)</option>
          </select>
        </div>
        <div id="preferensiError" class="alert alert-error" style="display:none"></div>
        <button type="submit" class="btn btn-primary" id="preferensiBtn">Simpan Preferensi</button>
      </form>
    `;

    const form = document.getElementById('preferensiForm');
    const errorDiv = document.getElementById('preferensiError');
    const btn = document.getElementById('preferensiBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedMakan = document.querySelector('input[name="prefMakan"]:checked');
        const targetKalori = parseInt(document.getElementById('prefTargetKalori').value);

        const data = {
          tujuan: document.getElementById('prefTujuan').value,
          preferensi_makan: selectedMakan ? selectedMakan.value : 'semua',
          targetKalori: targetKalori >= 500 && targetKalori <= 5000 ? targetKalori : 2000,
          alergi: document.getElementById('prefAlergi').value.trim(),
          jumlah_makan: parseInt(document.getElementById('prefJumlahMakan').value) || 3
        };

        try {
          if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
          if (errorDiv) errorDiv.style.display = 'none';
          await Rekomendasi.simpanPreferensi(data);
        } catch (err) {
          if (errorDiv) {
            errorDiv.style.display = 'flex';
            errorDiv.innerHTML = `<span class="alert-icon">⚠️</span><span>${err.message}</span>`;
          }
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = 'Simpan Preferensi'; }
        }
      });
    }
  },

  async simpanPreferensi(data) {
    await API.post('/rekomendasi/preferensi', data);
    App.showToast('Preferensi berhasil disimpan', 'success');
    this.showRekomendasi();
  },

  showMenuRekomendasi(menus, container) {
    if (!container) {
      const content = document.getElementById('rekomendasiContent');
      if (!content) return;
      container = content;
    }

    const div = document.createElement('div');
    div.className = 'slide-down';
    div.innerHTML = `
      <div class="section-header">
        <h2>💡 Menu Rekomendasi</h2>
      </div>
    `;

    const iconMap = {
      'Sarapan': '🌅',
      'Makan Siang': '☀️',
      'Makan Malam': '🌙',
      'Camilan': '🍿',
      'Pokok': '🍚',
      'Lauk/Pendamping': '🥘',
      'Minuman': '🥤',
      'Lainnya': '🍴'
    };

    const grouped = {};
    menus.forEach(m => {
      const waktu = m.waktu_makan || m.kategori || 'Lainnya';
      if (!grouped[waktu]) grouped[waktu] = [];
      grouped[waktu].push(m);
    });

    const waktuOrder = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Lauk/Pendamping', 'Pokok', 'Camilan', 'Minuman', 'Lainnya'];

    waktuOrder.forEach(waktu => {
      const list = grouped[waktu];
      if (!list || list.length === 0) return;

      const group = document.createElement('div');
      group.className = 'card';
      group.innerHTML = `<div class="card-header"><h3>${iconMap[waktu] || '🍴'} ${waktu}</h3></div>`;

      const badgeColor = { 'vegetarian': '#4CAF50', 'vegan': '#8BC34A', 'normal': '#FF9800' };
      const preferensiAktif = document.querySelector('#rekomendasiContent')?.__prefAktif || 'semua';
      const isProtein = preferensiAktif === 'tinggi_protein';
      const isLowCarbo = preferensiAktif === 'rendah_karbo';

      list.forEach(menu => {
        const item = document.createElement('div');
        item.className = 'list-item';
        const tipe = menu.tipe_diet || 'normal';
        const badgeBg = badgeColor[tipe] || '#999';
        const prot = menu.protein || 0;
        const karbo = menu.karbohidrat || 0;

        let highlightHtml = '';
        if (isProtein) {
          highlightHtml = `<div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;"><span style="background:#FF5722;color:white;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:700;">💪 Protein ${prot}g</span><span style="background:${badgeBg};color:white;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:600;">${tipe}</span></div>`;
        } else if (isLowCarbo) {
          highlightHtml = `<div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;"><span style="background:#4CAF50;color:white;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:700;">🥩 Karbo ${karbo}g</span><span style="background:${badgeBg};color:white;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:600;">${tipe}</span></div>`;
        } else {
          highlightHtml = `<div style="margin-top:4px;"><span style="background:${badgeBg};color:white;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:600;">${tipe}</span></div>`;
        }

        item.innerHTML = `
          <div class="list-icon bg-orange-light">${menu.emoji || '🍲'}</div>
          <div class="list-content">
            <div class="title">${menu.nama || menu.nama_menu || '-'}</div>
            <div class="subtitle">${menu.kalori || 0} kal &middot; P:${prot}g L:${menu.lemak || 0}g K:${karbo}g</div>
            ${highlightHtml}
          </div>
          <div class="list-end">
            <button class="btn btn-sm btn-primary" onclick="Rekomendasi.catatPilihan(${JSON.stringify(menu).replace(/"/g, "'")})">Catat</button>
          </div>
        `;
        group.appendChild(item);
      });

      div.appendChild(group);
    });

    container.appendChild(div);
  },

  async catatPilihan(menu) {
    try {
      const data = {
        id_makanan: menu.id || menu.id_menu,
        nama_makanan: menu.nama || menu.nama_menu,
        porsi: 1,
        kalori: menu.kalori || 0,
        protein: menu.protein || 0,
        lemak: menu.lemak || 0,
        karbohidrat: menu.karbohidrat || 0,
        waktu_makan: menu.waktu_makan || 'Sarapan',
        dari_rekomendasi: true
      };

      await API.post('/konsumsi/simpan', data);
      App.showToast(`${menu.nama || menu.nama_menu} berhasil dicatat!`, 'success');
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  }
};
