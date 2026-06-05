const Auth = {
  togglePassword(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '\u{1F648}';
    } else {
      input.type = 'password';
      btn.textContent = '\u{1F441}';
    }
  },

  async login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    API.setToken(data.data.token);
    App.navigate('dashboard');
    return data;
  },

  async register(nama, email, password) {
    const data = await API.post('/auth/register', { nama, email, password });
    API.setToken(data.data.token);
    App.showToast('Pendaftaran berhasil!', 'success');
    App.navigate('dashboard');
  },

  logout() {
    API.setToken(null);
    App.navigate('splash');
    App.showToast('Anda telah keluar', 'success');
  },

  isAuthenticated() {
    return !!API.token;
  },

  initAuthPages() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabSignin = document.getElementById('tabSignin');
    const tabSignup = document.getElementById('tabSignup');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    if (tabSignin && tabSignup) {
      tabSignin.addEventListener('click', () => {
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      });

      tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
          if (loginError) { loginError.textContent = 'Email dan password harus diisi'; loginError.style.display = 'flex'; }
          return;
        }

        try {
          if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Memproses...';
          }
          if (loginError) { loginError.textContent = ''; loginError.style.display = 'none'; }
          await Auth.login(email, password);
        } catch (err) {
          if (loginError) { loginError.textContent = err.message; loginError.style.display = 'flex'; }
        } finally {
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'MASUK';
          }
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword')?.value;

        if (!nama || !email || !password) {
          if (registerError) { registerError.textContent = 'Semua field harus diisi'; registerError.style.display = 'flex'; }
          return;
        }

        if (password.length < 8) {
          if (registerError) { registerError.textContent = 'Password minimal 8 karakter'; registerError.style.display = 'flex'; }
          return;
        }

        if (!confirmPassword || password !== confirmPassword) {
          if (registerError) { registerError.textContent = 'Konfirmasi password tidak cocok'; registerError.style.display = 'flex'; }
          return;
        }

        try {
          if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.textContent = 'Memproses...';
          }
          if (registerError) { registerError.textContent = ''; registerError.style.display = 'none'; }
          await Auth.register(nama, email, password);
        } catch (err) {
          if (registerError) { registerError.textContent = err.message; registerError.style.display = 'flex'; }
        } finally {
          if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = 'DAFTAR';
          }
        }
      });
    }
  }
};
