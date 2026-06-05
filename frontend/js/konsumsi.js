const Konsumsi = {
  selectedWaktu: '',
  selectedMenu: null,
  selectedPorsi: 1,
  searchTimeout: null,

  showPilihWaktu() {
    App.navigate('catat-makanan');
    const content = document.getElementById('catatMakananContent');
    if (!content) return;

    content.innerHTML = `
      <div class="section-header">
        <h2>Kapan Anda makan?</h2>
      </div>
      <div class="radio-group" id="waktuRadioGroup">
        <label class="radio-item">
          <input type="radio" name="waktu_makan" value="Sarapan" checked onchange="Konsumsi.pilihWaktu('Sarapan')">
          <span class="radio-indicator"></span>
          <span class="radio-label">Sarapan</span>
        </label>
        <label class="radio-item">
          <input type="radio" name="waktu_makan" value="Makan Siang" onchange="Konsumsi.pilihWaktu('Makan Siang')">
          <span class="radio-indicator"></span>
          <span class="radio-label">Makan Siang</span>
        </label>
        <label class="radio-item">
          <input type="radio" name="waktu_makan" value="Makan Malam" onchange="Konsumsi.pilihWaktu('Makan Malam')">
          <span class="radio-indicator"></span>
          <span class="radio-label">Makan Malam</span>
        </label>
      </div>
      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="Konsumsi.showPilihMakanan()">LANJUT</button>
      </div>
    `;

    this.selectedWaktu = 'Sarapan';
  },

  pilihWaktu(waktu) {
    this.selectedWaktu = waktu;
  },

  showPilihMakanan() {
    App.navigate('cari-makanan');
    const content = document.getElementById('cariMakananContent');
    if (!content) return;

    content.innerHTML = `
      <div class="search-bar">
        <input class="search-input" id="searchMakananInput" type="text" placeholder="Cari Makanan" autofocus>
      </div>
      <div class="section-header" style="margin-top:4px;">
        <h2>Daftar Makanan</h2>
      </div>
      <div id="makananHasil">
        <div class="loading-wrap"><div class="loading-spinner sm"></div><p>Memuat menu...</p></div>
      </div>
    `;

    this.loadSemuaMakanan();

    const input = document.getElementById('searchMakananInput');
    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          const val = input.value.trim();
          if (val.length >= 2) {
            this.cariMakanan(val);
          } else {
            this.loadSemuaMakanan();
          }
        }, 400);
      });
    }
  },

  async loadSemuaMakanan() {
    const hasilDiv = document.getElementById('makananHasil');
    if (!hasilDiv) return;
    try {
      const data = await API.get('/konsumsi/search?keyword=');
      const items = data.data || data.makanan || data;
      if (!items || items.length === 0) {
        hasilDiv.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>Menu kosong</h3><p>Belum ada data makanan. Import database terlebih dahulu.</p></div>';
        return;
      }
      this.renderDaftarMakanan(items, hasilDiv);
    } catch (err) {
      hasilDiv.innerHTML = `<div class="alert alert-error"><span class="alert-icon">⚠️</span><span>${err.message}</span></div>`;
    }
  },

  renderDaftarMakanan(items, container) {
    const grouped = {};
    const kategoriUrutan = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Lauk/Pendamping', 'Camilan', 'Minuman', 'Pokok'];
    items.forEach(item => {
      const k = item.kategori || 'Lainnya';
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(item);
    });

    container.innerHTML = '';

    kategoriUrutan.forEach(kat => {
      const list = grouped[kat];
      if (!list || list.length === 0) return;
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `<h3>${kat}</h3>`;
      container.appendChild(header);
      list.forEach(menu => {
        const item = document.createElement('div');
        item.className = 'makanan-item';
        item.onclick = () => Konsumsi.pilihMakanan(menu);
        item.innerHTML = `
          <div class="makanan-icon">${menu.emoji || '🍲'}</div>
          <div class="makanan-info">
            <div class="name">${menu.nama_makanan || '-'}</div>
            <div class="cal">${menu.kalori || 0} kal | ${menu.protein || 0}g protein</div>
          </div>
          <div class="makanan-arrow">›</div>
        `;
        container.appendChild(item);
      });
    });

    container.appendChild(document.createElement('div')).innerHTML = '<button class="btn btn-secondary" onclick="Konsumsi.showCatatManual()" style="margin-top:12px;">+Catat Manual</button>';
  },

  async cariMakanan(keyword) {
    const hasilDiv = document.getElementById('makananHasil');
    if (!hasilDiv) return;

    if (!keyword || keyword.length < 2) {
      hasilDiv.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Cari Makanan</h3><p>Ketik minimal 2 karakter</p></div>';
      return;
    }

    hasilDiv.innerHTML = '<div class="loading-wrap"><div class="loading-spinner sm"></div><p>Mencari...</p></div>';

    try {
      const data = await API.get(`/konsumsi/search?keyword=${encodeURIComponent(keyword)}`);
      const items = data.data || data.makanan || data;

      if (!items || items.length === 0) {
        hasilDiv.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">😕</div>
            <h3>Tidak ditemukan</h3>
            <p>Makanan "${keyword}" tidak ditemukan. Coba kata kunci lain atau catat manual.</p>
            <button class="btn btn-secondary" onclick="Konsumsi.showCatatManual()">Catat Manual</button>
          </div>
        `;
        return;
      }

      hasilDiv.innerHTML = '';
      items.forEach(menu => {
        const item = document.createElement('div');
        item.className = 'makanan-item';
        item.onclick = () => Konsumsi.pilihMakanan(menu);
        item.innerHTML = `
          <div class="makanan-icon">${menu.emoji || '🍲'}</div>
          <div class="makanan-info">
            <div class="name">${menu.nama || menu.nama_makanan || '-'}</div>
            <div class="cal">${menu.kalori || 0} kal | ${menu.porsi_saran || '1 porsi'}</div>
          </div>
          <div class="makanan-arrow">›</div>
        `;
        hasilDiv.appendChild(item);
      });
    } catch (err) {
      hasilDiv.innerHTML = `
        <div class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>${err.message}</span>
        </div>
        <button class="btn btn-secondary" onclick="Konsumsi.showCatatManual()">Catat Manual</button>
      `;
    }
  },

  pilihMakanan(menu) {
    this.selectedMenu = menu;
    this.selectedPorsi = 1;
    this.showDetailKonsumsi();
  },

  showCatatManual() {
    App.navigate('catat-manual');
    const content = document.getElementById('catatManualContent');
    if (!content) return;

    content.innerHTML = `
      <form id="manualForm">
        <div class="form-group">
          <label>Nama Makanan:</label>
          <input class="form-input" id="manualNama" type="text" placeholder="Masukkan nama..." required>
        </div>
        <div class="form-group">
          <label>Kalori (kal):</label>
          <input class="form-input" id="manualKalori" type="number" placeholder="0" min="0" required>
        </div>
        <div class="form-group">
          <label>Protein (g):</label>
          <input class="form-input" id="manualProtein" type="number" placeholder="0" min="0" step="0.1">
        </div>
        <div class="form-group">
          <label>Lemak (g):</label>
          <input class="form-input" id="manualLemak" type="number" placeholder="0" min="0" step="0.1">
        </div>
        <div class="form-group">
          <label>Karbohidrat (g):</label>
          <input class="form-input" id="manualKarbo" type="number" placeholder="0" min="0" step="0.1">
        </div>
        <div id="manualError" class="alert alert-error" style="display:none"></div>
        <button type="submit" class="btn btn-primary" id="manualSimpanBtn">Simpan</button>
      </form>
    `;

    const form = document.getElementById('manualForm');
    const errorDiv = document.getElementById('manualError');
    const btn = document.getElementById('manualSimpanBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          nama_makanan: document.getElementById('manualNama').value.trim(),
          kalori: parseFloat(document.getElementById('manualKalori').value) || 0,
          porsi: 1,
          protein: parseFloat(document.getElementById('manualProtein').value) || 0,
          lemak: parseFloat(document.getElementById('manualLemak').value) || 0,
          karbohidrat: parseFloat(document.getElementById('manualKarbo').value) || 0,
          catatan: '',
          waktu_makan: Konsumsi.selectedWaktu || 'Sarapan'
        };

        if (!data.nama_makanan) {
          if (errorDiv) { errorDiv.style.display = 'flex'; errorDiv.textContent = 'Nama makanan harus diisi'; }
          return;
        }

        try {
          if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
          if (errorDiv) errorDiv.style.display = 'none';
          await Konsumsi.simpanManual(data);
        } catch (err) {
          if (errorDiv) { errorDiv.style.display = 'flex'; errorDiv.innerHTML = `<span class="alert-icon">⚠️</span><span>${err.message}</span>`; }
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = 'Simpan'; }
        }
      });
    }
  },

  async simpanManual(data) {
    const result = await API.post('/konsumsi/simpan', data);
    this.showDataTersimpan(result.data || result);
  },

  showDetailKonsumsi() {
    const menu = this.selectedMenu;
    if (!menu) {
      App.showToast('Pilih makanan terlebih dahulu', 'warning');
      return;
    }

    App.navigate('detail-konsumsi');
    const content = document.getElementById('detailKonsumsiContent');
    if (!content) return;

    const porsi = this.selectedPorsi;
    const kaloriPerPorsi = this.editedKalori || menu.kalori || menu.kalori_per_porsi || 0;
    const proteinPerPorsi = menu.protein || 0;
    const lemakPerPorsi = menu.lemak || 0;
    const karboPerPorsi = menu.karbohidrat || 0;

    content.innerHTML = `
      <div class="card card-orange" style="text-align:center;padding:20px;">
        <div style="font-size:48px;margin-bottom:8px;">${menu.emoji || '🍲'}</div>
        <h3 style="font-size:20px;font-weight:700;">${menu.nama || menu.nama_makanan || '-'}</h3>
        <p style="font-size:13px;color:var(--text-light);margin-top:4px;">${menu.deskripsi || ''}</p>
        <div style="margin-top:12px;">
          <label style="font-size:13px;font-weight:600;display:block;text-align:left;">Kalori (kal):</label>
          <input class="form-input" id="detailKaloriInput" type="number" value="${kaloriPerPorsi}" min="0" onchange="Konsumsi.updateKaloriPerPorsi(this.value)" style="margin-top:4px;text-align:center;">
        </div>
      </div>
      <div class="nutrisi-detail">
        <div class="nutrisi-row">
          <span class="lbl">Protein</span>
          <span class="val">${proteinPerPorsi}g</span>
        </div>
        <div class="nutrisi-row">
          <span class="lbl">Lemak</span>
          <span class="val">${lemakPerPorsi}g</span>
        </div>
        <div class="nutrisi-row">
          <span class="lbl">Karbohidrat</span>
          <span class="val">${karboPerPorsi}g</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:16px;">
        <button class="porsi-btn" onclick="Konsumsi.kurangPorsi()">−</button>
        <input class="form-input" id="porsiInput" type="number" value="${porsi}" min="0.5" max="10" step="0.5" onchange="Konsumsi.updatePorsiFromInput(this.value)" style="width:60px;text-align:center;font-size:18px;font-weight:700;">
        <button class="porsi-btn" onclick="Konsumsi.tambahPorsi()">+</button>
      </div>
      <div style="margin-bottom:16px;">
        <div class="section-header"><h2>Total Nutrisi:</h2></div>
        <div class="nutrisi-detail">
          <div class="nutrisi-row">
            <span class="lbl">Kalori</span>
            <span class="val orange" id="totalKaloriDetail">${Math.round(kaloriPerPorsi * porsi)} kal</span>
          </div>
          <div class="nutrisi-row">
            <span class="lbl">Karbohidrat</span>
            <span class="val" id="totalKarboDetail">${Math.round(karboPerPorsi * porsi)}g</span>
          </div>
          <div class="nutrisi-row">
            <span class="lbl">Protein</span>
            <span class="val" id="totalProteinDetail">${Math.round(proteinPerPorsi * porsi)}g</span>
          </div>
          <div class="nutrisi-row">
            <span class="lbl">Lemak</span>
            <span class="val" id="totalLemakDetail">${Math.round(lemakPerPorsi * porsi)}g</span>
          </div>
        </div>
      </div>
      <div id="detailKonsumsiError" class="alert alert-error" style="display:none"></div>
      <button class="btn btn-primary" id="simpanKonsumsiBtn" onclick="Konsumsi.simpanKonsumsi()" style="width:100%;">SIMPAN</button>
    `;
  },

  updateKaloriPerPorsi(value) {
    this.editedKalori = parseFloat(value) || 0;
    this.updatePorsiUI();
  },

  updatePorsiFromInput(value) {
    this.selectedPorsi = Math.max(0.5, Math.min(10, parseFloat(value) || 1));
    this.updatePorsiUI();
  },

  tambahPorsi() {
    this.selectedPorsi = Math.min(10, this.selectedPorsi + 0.5);
    this.updatePorsiUI();
  },

  kurangPorsi() {
    this.selectedPorsi = Math.max(0.5, this.selectedPorsi - 0.5);
    this.updatePorsiUI();
  },

  updatePorsiUI() {
    const porsiInput = document.getElementById('porsiInput');
    const totalKalori = document.getElementById('totalKaloriDetail');
    const totalKarbo = document.getElementById('totalKarboDetail');
    const totalProtein = document.getElementById('totalProteinDetail');
    if (porsiInput) porsiInput.value = this.selectedPorsi;
    if (totalKalori && this.selectedMenu) {
      const kal = this.editedKalori || this.selectedMenu.kalori || this.selectedMenu.kalori_per_porsi || 0;
      totalKalori.textContent = Math.round(kal * this.selectedPorsi) + ' kal';
    }
    if (totalKarbo && this.selectedMenu) {
      const karbo = this.selectedMenu.karbohidrat || 0;
      totalKarbo.textContent = Math.round(karbo * this.selectedPorsi) + 'g';
    }
    if (totalProtein && this.selectedMenu) {
      const protein = this.selectedMenu.protein || 0;
      totalProtein.textContent = Math.round(protein * this.selectedPorsi) + 'g';
    }
    const totalLemak = document.getElementById('totalLemakDetail');
    if (totalLemak && this.selectedMenu) {
      const lemak = this.selectedMenu.lemak || 0;
      totalLemak.textContent = Math.round(lemak * this.selectedPorsi) + 'g';
    }
  },

  async simpanKonsumsi() {
    const menu = this.selectedMenu;
    if (!menu) return;

    const btn = document.getElementById('simpanKonsumsiBtn');
    const errorDiv = document.getElementById('detailKonsumsiError');

    const data = {
      id_makanan: menu.id || menu.id_makanan,
      nama_makanan: menu.nama || menu.nama_makanan,
      porsi: this.selectedPorsi,
      kalori: (this.editedKalori || menu.kalori || menu.kalori_per_porsi || 0) * this.selectedPorsi,
      protein: (menu.protein || 0) * this.selectedPorsi,
      lemak: (menu.lemak || 0) * this.selectedPorsi,
      karbohidrat: (menu.karbohidrat || 0) * this.selectedPorsi,
      waktu_makan: this.selectedWaktu || 'Sarapan'
    };

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
      if (errorDiv) errorDiv.style.display = 'none';

      const result = await API.post('/konsumsi/simpan', data);
      this.showDataTersimpan(result.data || result);
    } catch (err) {
      if (errorDiv) {
        errorDiv.style.display = 'flex';
        errorDiv.innerHTML = `<span class="alert-icon">⚠️</span><span>${err.message}</span>`;
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Simpan Konsumsi'; }
    }
  },

  showDataTersimpan(data) {
    App.navigate('konsumsi-tersimpan');
    const content = document.getElementById('konsumsiTersimpanContent');
    if (!content) return;

    const nama = data.nama_makanan || '-';
    const porsi = data.porsi || 1;
    const totalKal = Math.round(data.kalori || 0);

    content.innerHTML = `
      <div class="success-page">
        <div class="success-icon">✓</div>
        <h2>Berhasil Disimpan!</h2>
        <p>Data konsumsi Anda telah disimpan</p>
        <div class="card" style="text-align:left;padding:12px 16px;">
          <div style="font-size:16px;font-weight:600;">${nama} - ${porsi} Porsi</div>
        </div>
        <div style="text-align:center;padding:8px 0;">
          <div style="font-size:14px;color:var(--text-light);">Total: ${totalKal} kalori</div>
          <div style="font-size:13px;color:var(--green);font-weight:600;margin-top:4px;">Simpan</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <button class="btn btn-primary" onclick="Konsumsi.showPilihWaktu()">TAMBAH LAGI</button>
          <button class="btn btn-outline" onclick="App.navigate('dashboard')">KE BERANDA</button>
        </div>
      </div>
    `;
  }
};
