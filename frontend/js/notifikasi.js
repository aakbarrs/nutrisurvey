const Notifikasi = {
  settings: null,

  async showPengaturan() {
    App.navigate('notifikasi');
    const content = document.getElementById('notifikasiContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat pengaturan...</p></div>';

    try {
      const data = await API.get('/notifikasi/pengaturan');
      this.settings = data.data || data.pengaturan || data;

      if (!this.settings || typeof this.settings !== 'object') {
        this.settings = {
          sarapan_aktif: true,
          sarapan_waktu: '07:00',
          siang_aktif: true,
          siang_waktu: '12:00',
          malam_aktif: true,
          malam_waktu: '19:00'
        };
      }

      this.renderPengaturan();
    } catch (err) {
      this.settings = {
        sarapan_aktif: true,
        sarapan_waktu: '07:00',
        siang_aktif: true,
        siang_waktu: '12:00',
        malam_aktif: true,
        malam_waktu: '19:00'
      };
      this.renderPengaturan();
    }
  },

  renderPengaturan() {
    const content = document.getElementById('notifikasiContent');
    if (!content) return;

    const s = this.settings;
    const [sarapanH, sarapanM] = (s.sarapan_waktu || '07:00').split(':');
    const [siangH, siangM] = (s.siang_waktu || '12:00').split(':');
    const [malamH, malamM] = (s.malam_waktu || '19:00').split(':');

    content.innerHTML = `
      <div class="slide-down">
        <div class="section-header">
          <h2>🔔 Pengaturan Notifikasi</h2>
        </div>
        <div class="card card-blue">
          <div class="card-header">
            <h3>⏰ Pengingat Makan</h3>
          </div>
          <div class="card-body">
            Atur pengingat waktu makan agar tidak terlewat
          </div>
        </div>
        <div class="card">
          <div class="toggle-wrap">
            <div>
              <div class="toggle-label">🌅 Sarapan</div>
              <div class="toggle-desc">Pengingat makan pagi</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggleSarapan" ${s.sarapan_aktif ? 'checked' : ''} onchange="Notifikasi.toggleSarapan()">
              <span class="slider"></span>
            </label>
          </div>
          <div id="waktuSarapanGroup" style="${s.sarapan_aktif ? '' : 'display:none'}">
            <label style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;display:block;">Waktu</label>
            <div class="time-picker-row">
              <select id="sarapanJam">
                ${this.generateHourOptions(sarapanH)}
              </select>
              <span class="sep">:</span>
              <select id="sarapanMenit">
                ${this.generateMinuteOptions(sarapanM)}
              </select>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="toggle-wrap">
            <div>
              <div class="toggle-label">☀️ Makan Siang</div>
              <div class="toggle-desc">Pengingat makan siang</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggleSiang" ${s.siang_aktif ? 'checked' : ''} onchange="Notifikasi.toggleSiang()">
              <span class="slider"></span>
            </label>
          </div>
          <div id="waktuSiangGroup" style="${s.siang_aktif ? '' : 'display:none'}">
            <label style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;display:block;">Waktu</label>
            <div class="time-picker-row">
              <select id="siangJam">
                ${this.generateHourOptions(siangH)}
              </select>
              <span class="sep">:</span>
              <select id="siangMenit">
                ${this.generateMinuteOptions(siangM)}
              </select>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="toggle-wrap">
            <div>
              <div class="toggle-label">🌙 Makan Malam</div>
              <div class="toggle-desc">Pengingat makan malam</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggleMalam" ${s.malam_aktif ? 'checked' : ''} onchange="Notifikasi.toggleMalam()">
              <span class="slider"></span>
            </label>
          </div>
          <div id="waktuMalamGroup" style="${s.malam_aktif ? '' : 'display:none'}">
            <label style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;display:block;">Waktu</label>
            <div class="time-picker-row">
              <select id="malamJam">
                ${this.generateHourOptions(malamH)}
              </select>
              <span class="sep">:</span>
              <select id="malamMenit">
                ${this.generateMinuteOptions(malamM)}
              </select>
            </div>
          </div>
        </div>
        <div id="notifikasiError" class="alert alert-error" style="display:none"></div>
        <button class="btn btn-primary" onclick="Notifikasi.simpanPengaturan()" id="notifSimpanBtn">
          Simpan Pengaturan
        </button>
      </div>
    `;

    document.getElementById('toggleSarapan').addEventListener('change', () => this.toggleSarapan());
    document.getElementById('toggleSiang').addEventListener('change', () => this.toggleSiang());
    document.getElementById('toggleMalam').addEventListener('change', () => this.toggleMalam());
  },

  generateHourOptions(selected) {
    let opts = '';
    for (let i = 0; i < 24; i++) {
      const val = String(i).padStart(2, '0');
      opts += `<option value="${val}" ${val === selected ? 'selected' : ''}>${val}</option>`;
    }
    return opts;
  },

  generateMinuteOptions(selected) {
    let opts = '';
    for (let i = 0; i < 60; i += 5) {
      const val = String(i).padStart(2, '0');
      opts += `<option value="${val}" ${val === selected ? 'selected' : ''}>${val}</option>`;
    }
    return opts;
  },

  toggleSarapan() {
    const cb = document.getElementById('toggleSarapan');
    const group = document.getElementById('waktuSarapanGroup');
    if (cb && group) {
      group.style.display = cb.checked ? '' : 'none';
    }
  },

  toggleSiang() {
    const cb = document.getElementById('toggleSiang');
    const group = document.getElementById('waktuSiangGroup');
    if (cb && group) {
      group.style.display = cb.checked ? '' : 'none';
    }
  },

  toggleMalam() {
    const cb = document.getElementById('toggleMalam');
    const group = document.getElementById('waktuMalamGroup');
    if (cb && group) {
      group.style.display = cb.checked ? '' : 'none';
    }
  },

  updateWaktu(makan, time) {

  },

  async simpanPengaturan() {
    const btn = document.getElementById('notifSimpanBtn');
    const errorDiv = document.getElementById('notifikasiError');

    const data = {
      sarapan_aktif: document.getElementById('toggleSarapan').checked,
      sarapan_waktu: `${document.getElementById('sarapanJam').value}:${document.getElementById('sarapanMenit').value}`,
      siang_aktif: document.getElementById('toggleSiang').checked,
      siang_waktu: `${document.getElementById('siangJam').value}:${document.getElementById('siangMenit').value}`,
      malam_aktif: document.getElementById('toggleMalam').checked,
      malam_waktu: `${document.getElementById('malamJam').value}:${document.getElementById('malamMenit').value}`
    };

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
      if (errorDiv) errorDiv.style.display = 'none';

      await API.post('/notifikasi/simpan', data);
      this.settings = data;
      this.showSukses(data);
    } catch (err) {
      if (errorDiv) {
        errorDiv.style.display = 'flex';
        errorDiv.innerHTML = `<span class="alert-icon">⚠️</span><span>${err.message}</span>`;
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Simpan Pengaturan'; }
    }
  },

  showSukses(data) {
    App.showToast('Pengaturan notifikasi berhasil disimpan', 'success');
    this.showPengaturan();
  }
};
