const App = {
  currentPage: 'splash',
  pages: {},
  navItems: {},

  init() {
    this.cacheElements();
    this.initRouter();
    this.initBottomNav();
    this.initSplashButtons();
    Auth.initAuthPages();
    this.checkAuth();

    if (this.pages.splash) {
      this.pages.splash.classList.add('active');
    }
  },

  cacheElements() {
    const pageIds = [
      'splash', 'login', 'dashboard', 'catat-makanan', 'cari-makanan',
      'catat-manual', 'detail-konsumsi', 'konsumsi-tersimpan',
      'rekomendasi', 'preferensi',
      'berat-badan', 'catat-berat', 'konfirmasi-berat', 'berat-tersimpan',
      'analisis', 'notifikasi', 'riwayat', 'profil',
      'verifikasi-email', 'selamat-datang', 'signin-error', 'register-error',
      'dashboard-data',
      'menu-profil', 'pengaturan-notifikasi', 'notifikasi-sukses',
      'pengaturan-notifikasi-1nonaktif', 'pengaturan-notifikasi-partial'
    ];

    pageIds.forEach(id => {
      this.pages[id] = document.getElementById(`page-${id}`);
    });

    this.navItems = {
      beranda: document.getElementById('navBeranda'),
      riwayat: document.getElementById('navRiwayat'),
      profil: document.getElementById('navProfil')
    };
  },

  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => {
      if (window.location.hash) {
        this.handleRoute();
      }
    });
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'splash';
    const pageName = hash.split('?')[0];

    const publicPages = ['splash', 'login'];

    if (!publicPages.includes(pageName) && !Auth.isAuthenticated()) {
      this.navigate('splash');
      return;
    }

    this.showPage(pageName);

    switch (pageName) {
      case 'dashboard':
        Dashboard.loadDashboard();
        this.updateBottomNav('beranda');
        break;
      case 'dashboard-data':
        Dashboard.loadDashboard();
        this.updateBottomNav('beranda');
        break;
      case 'riwayat':
        this.showRiwayat();
        this.updateBottomNav('riwayat');
        break;
      case 'profil':
        this.showProfil();
        this.updateBottomNav('profil');
        break;
      case 'analisis':
        Analisis.showLaporanAnalisis();
        break;
      case 'loading-analisis':
        Analisis.startLoading();
        break;
      case 'hasil-analisis-warning':
        Analisis.showWarning();
        break;
      case 'rekomendasi':
        Rekomendasi.showRekomendasi();
        break;
      case 'catat-makanan':
        Konsumsi.showPilihWaktu();
        break;
      case 'cari-makanan':
        Konsumsi.showPilihMakanan();
        break;
      case 'catat-manual':
        Konsumsi.showCatatManual();
        break;
      case 'berat-badan':
        BeratBadan.showPemantauan();
        break;
      case 'menu-profil':
        this.loadMenuProfil();
        break;
      case 'notifikasi':
        Notifikasi.showPengaturan();
        break;
      case 'pengaturan-notifikasi':
      case 'notifikasi-sukses':
      case 'pengaturan-notifikasi-1nonaktif':
      case 'pengaturan-notifikasi-partial':
        break;
    }
  },

  navigate(page) {
    window.location.hash = `#${page}`;
  },

  showPage(pageId) {
    Object.values(this.pages).forEach(p => {
      if (p) p.classList.remove('active');
    });

    const page = this.pages[pageId];
    if (page) {
      page.classList.add('active');
      this.currentPage = pageId;
    }
  },

  initBottomNav() {
    Object.entries(this.navItems).forEach(([name, el]) => {
      if (el) {
        el.addEventListener('click', () => {
          const pageMap = {
            beranda: 'dashboard',
            riwayat: 'riwayat',
            profil: 'profil'
          };
          this.navigate(pageMap[name] || name);
        });
      }
    });
  },

  updateBottomNav(active) {
    Object.values(this.navItems).forEach(el => {
      if (el) el.classList.remove('active');
    });
    if (this.navItems[active]) {
      this.navItems[active].classList.add('active');
    }
  },

  initSplashButtons() {
    const loginBtn = document.getElementById('splashLogin');
    const registerBtn = document.getElementById('splashRegister');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.navigate('login'));
    }
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        this.navigate('login');
        setTimeout(() => {
          const tabSignup = document.getElementById('tabSignup');
          if (tabSignup) tabSignup.click();
        }, 100);
      });
    }
  },

  checkAuth() {
    if (Auth.isAuthenticated()) {
      this.navigate('dashboard');
    }
  },

  loadMenuProfil() {
    const nameEl = document.querySelector('#page-menu-profil .menu-profil-nama');
    const emailEl = document.querySelector('#page-menu-profil .menu-profil-email');
    const avatarEl = document.querySelector('#page-menu-profil .menu-profil-avatar');
    if (!nameEl && !emailEl) return;

    API.get('/profil').then(data => {
      const user = data.data || data.user || data;
      if (nameEl) nameEl.textContent = user.nama || 'Pengguna';
      if (emailEl) emailEl.textContent = user.email || '-';
      if (avatarEl) {
        const initial = (user.nama || 'U')[0].toUpperCase();
        avatarEl.textContent = initial;
      }
    }).catch(() => {});
  },

  showRiwayat() {
    const content = document.getElementById('riwayatContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat riwayat...</p></div>';

    API.get('/konsumsi/harian?limit=50').then(data => {
      const items = data.data || data.konsumsi || data || [];
      content.innerHTML = '';

      if (!items || (Array.isArray(items) && items.length === 0)) {
        content.innerHTML = `
          <div class="section-header"><h2>📋 Riwayat Konsumsi</h2></div>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>Belum Ada Riwayat</h3>
            <p>Catat makanan Anda untuk melihat riwayat konsumsi</p>
            <button class="btn btn-primary" onclick="App.navigate('catat-makanan')">Catat Makanan</button>
          </div>
        `;
        return;
      }

      const list = Array.isArray(items) ? items : (items.records || []);

      const todayStr = new Date().toLocaleDateString('id-ID');

      content.innerHTML = `
        <div class="section-header">
          <h2>📋 Riwayat Konsumsi</h2>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button class="btn btn-primary" onclick="App.navigate('catat-makanan')" style="flex:1;">+ Catat Makanan</button>
        </div>
      `;

      const grouped = {};
      list.forEach(item => {
        const tgl = item.tanggal || item.created_at || '';
        const dateKey = tgl ? new Date(tgl).toLocaleDateString('id-ID') : 'Tanpa tanggal';
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      });

      Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).slice(0, 14).forEach(date => {
        const dayItems = grouped[date];
        const totalKal = dayItems.reduce((s, i) => s + (i.kalori || 0), 0);
        const isToday = date === todayStr;

        const group = document.createElement('div');
        group.className = 'card';
        group.style.marginBottom = '12px';
        group.innerHTML = `
          <div class="card-header">
            <h3>${date} ${isToday ? '<span class="badge badge-green">Hari Ini</span>' : ''}</h3>
            <span class="badge badge-orange">${totalKal} kal</span>
          </div>
        `;

        dayItems.slice(0, 20).forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'list-item';
          itemDiv.style.paddingRight = '4px';
          itemDiv.innerHTML = `
            <div class="list-icon bg-orange-light">🍲</div>
            <div class="list-content">
              <div class="title">${item.nama_makanan || item.nama_menu || '-'}</div>
              <div class="subtitle">${item.waktu_makan || '-'} · ${item.porsi || 1}x porsi</div>
            </div>
            <div class="list-end" style="flex-direction:row;align-items:center;gap:4px;">
              <div style="text-align:right;">
                <div class="value orange">${item.kalori || 0}</div>
                <div class="sub">kal</div>
              </div>
              <button class="btn-delete-item" data-id="${item.id}" title="Hapus" style="background:none;border:none;font-size:18px;cursor:pointer;padding:4px;color:var(--red);opacity:0.6;" onclick="App.hapusKonsumsi(${item.id})">🗑️</button>
            </div>
          `;
          group.appendChild(itemDiv);
        });

        content.appendChild(group);

        if (isToday && dayItems.length > 0) {
          const resetBtn = document.createElement('div');
          resetBtn.style.cssText = 'margin:-8px 0 16px;text-align:right;';
          resetBtn.innerHTML = `<button class="btn btn-sm btn-danger" onclick="App.resetHariIni()">🗑️ Reset Hari Ini</button>`;
          content.appendChild(resetBtn);
        }
      });
    }).catch(err => {
      content.innerHTML = `
        <div class="section-header"><h2>📋 Riwayat Konsumsi</h2></div>
        <div class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>${err.message}</span>
        </div>
      `;
    });
  },

  async hapusKonsumsi(id) {
    if (!confirm('Hapus catatan makanan ini?')) return;
    try {
      await API.delete('/konsumsi/' + id);
      this.showToast('Catatan berhasil dihapus', 'success');
      this.showRiwayat();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async resetHariIni() {
    const today = new Date().toLocaleDateString('id-ID');
    if (!confirm('Hapus SEMUA catatan makanan hari ini (' + today + ')?')) return;
    try {
      await API.post('/konsumsi/reset-hari', {});
      this.showToast('Semua catatan hari ini berhasil dihapus', 'success');
      this.showRiwayat();
      Dashboard.loadDashboard();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  showProfil() {
    const content = document.getElementById('profilContent');
    if (!content) return;

    content.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Memuat profil...</p></div>';

    API.get('/profil').then(data => {
      const user = data.data || data.user || data;

      content.innerHTML = `
        <div class="slide-down">
          <div class="card" style="text-align:center;padding:24px;">
            <div style="width:72px;height:72px;border-radius:50%;background:var(--orange);color:var(--white);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 12px;">
              ${(user.nama || user.email || 'U')[0].toUpperCase()}
            </div>
            <h2 style="font-size:20px;font-weight:700;">${user.nama || 'Pengguna'}</h2>
            <p style="font-size:14px;color:var(--text-light);">${user.email || ''}</p>
          </div>

          <div class="section-header"><h2>⚙️ Pengaturan</h2></div>

          <div class="card">
            <div class="list-item" onclick="App.navigate('notifikasi')" style="cursor:pointer;">
              <div class="list-icon bg-orange-light">🔔</div>
              <div class="list-content">
                <div class="title">Notifikasi</div>
                <div class="subtitle">Atur pengingat waktu makan</div>
              </div>
              <div class="makanan-arrow">›</div>
            </div>
          </div>

          <div class="card">
            <div class="list-item" onclick="App.navigate('analisis')" style="cursor:pointer;">
              <div class="list-icon bg-green-light">📊</div>
              <div class="list-content">
                <div class="title">Laporan & Analisis</div>
                <div class="subtitle">Lihat laporan konsumsi nutrisi</div>
              </div>
              <div class="makanan-arrow">›</div>
            </div>
          </div>

          <div class="card">
            <div class="list-item" onclick="App.navigate('rekomendasi')" style="cursor:pointer;">
              <div class="list-icon bg-blue-light">💡</div>
              <div class="list-content">
                <div class="title">Preferensi Makanan</div>
                <div class="subtitle">Atur preferensi untuk rekomendasi</div>
              </div>
              <div class="makanan-arrow">›</div>
            </div>
          </div>

          <div style="margin-top:24px;">
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <span>Aplikasi NutriSurvey v1.0.0</span>
            </div>
            <button class="btn btn-danger" onclick="Auth.logout()">Keluar</button>
          </div>
        </div>
      `;
    }).catch(() => {
      content.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--gray-300);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 12px;color:var(--white);">U</div>
          <h2 style="font-size:20px;font-weight:700;">Pengguna</h2>
          <p style="font-size:14px;color:var(--text-light);">${API.token ? 'Terautentikasi' : 'Belum masuk'}</p>
        </div>
        <div style="margin-top:24px;">
          <button class="btn btn-danger" onclick="Auth.logout()">Keluar</button>
        </div>
      `;
    });
  },

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
