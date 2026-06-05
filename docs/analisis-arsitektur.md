# Analisis Arsitektur NutriSurvey

## Klasifikasi Objek — Modul Konsumsi

| No | Nama Object | Jenis / Tipe Kelas | Layer | File Implementasi |
|---|---|---|---|---|
| 1 | UI Pilih Waktu Makan | Boundary (Interface) | Presentation | `frontend/index.html` (P002), `frontend/js/konsumsi.js` (`showPilihWaktu`) |
| 2 | UI Pilih Makanan | Boundary (Interface) | Presentation | `frontend/index.html` (P003), `frontend/js/konsumsi.js` (`showPilihMakanan`, `renderDaftarMakanan`, `cariMakanan`) |
| 3 | UI Catat Manual | Boundary (Interface) | Presentation | `frontend/index.html` (P004), `frontend/js/konsumsi.js` (`showCatatManual`, `simpanManual`) |
| 4 | UI Data Tersimpan | Boundary (Interface) | Presentation | `frontend/index.html` (P006), `frontend/js/konsumsi.js` (`showDataTersimpan`) |
| 5 | ControllerKonsumsi | Controller | Application Logic | `backend/controllers/KonsumsiController.js`, `frontend/js/konsumsi.js` (Konsumsi object) |
| 6 | MenuMakan | Entity (Database) | Persistence | `backend/models/MenuMakan.js`, tabel `menu_makanan` |
| 7 | KonsumsiHarian | Entity (Database) | Persistence | `backend/models/KonsumsiHarian.js`, tabel `konsumsi_harian` |

## Klasifikasi Objek — Modul Rekomendasi

| No | Nama Object | Jenis / Tipe Kelas | Layer | File Implementasi |
|---|---|---|---|---|
| 1 | UI Rekomendasi Menu | Boundary (Interface) | Presentation | `frontend/index.html` (P007), `frontend/pages/rekomendasi-menu.html` |
| 2 | UI Preferensi Anda | Boundary (Interface) | Presentation | `frontend/index.html` (P008), `frontend/pages/preferensi-anda.html` |
| 3 | UI Atur Preferensi | Boundary (Interface) | Presentation | `frontend/index.html` (P009), `frontend/pages/atur-preferensi.html`, `frontend/js/rekomendasi.js` (`showAturPreferensi`) |
| 4 | UI Menu Rekomendasi | Boundary (Interface) | Presentation | `frontend/index.html` (P010), `frontend/pages/menu-rekomendasi.html`, `frontend/js/rekomendasi.js` (`showMenuRekomendasi`) |
| 5 | ControllerRekomendasi | Controller | Application Logic | `backend/controllers/RekomendasiController.js`, `frontend/js/rekomendasi.js` (Rekomendasi object) |
| 6 | MenuMakan | Entity (Database) | Persistence | `backend/models/MenuMakan.js`, tabel `menu_makanan` |
| 7 | PreferensiPengguna | Entity (Database) | Persistence | `backend/models/PreferensiPengguna.js`, tabel `preferensi_pengguna` |
| 8 | RekomendasiMenu | Entity (Database) | Persistence | Virtual/computed — tidak ada tabel terpisah; dihasilkan dari MenuMakan + PreferensiPengguna |
| 9 | ProfilNutrisi | Entity (Database) | Persistence | `backend/models/ProfilNutrisi.js`, tabel `profil_nutrisi` |

## Klasifikasi Objek — Modul Autentikasi

| No | Nama Object | Jenis / Tipe Kelas | Layer | File Implementasi |
|---|---|---|---|---|
| 1 | UI Splash Screen | Boundary (Interface) | Presentation | `frontend/index.html` (P011), `frontend/pages/splash.html` |
| 2 | UI Sign In Sign Up | Boundary (Interface) | Presentation | `frontend/index.html` (P012), `frontend/pages/signin.html`, `frontend/js/auth.js` |
| 3 | UI Daftar Akun | Boundary (Interface) | Presentation | `frontend/index.html` (P013, dalam P012), `frontend/pages/register.html`, `frontend/js/auth.js` |
| 4 | UI Verifikasi Email | Boundary (Interface) | Presentation | `frontend/index.html` (P014), `frontend/pages/verifikasi-email.html` |
| 5 | UI Selamat Datang | Boundary (Interface) | Presentation | `frontend/index.html` (P015), `frontend/pages/selamat-datang.html` |
| 6 | UI Dashboard (Belum Ada Data) | Boundary (Interface) | Presentation | `frontend/index.html` (P023), `frontend/pages/dashboard-empty.html` |
| 7 | UI Dashboard (Data Tercatat) | Boundary (Interface) | Presentation | `frontend/index.html` (P024), `frontend/js/dashboard.js` |
| 7 | ControllerAutentikasi | Controller | Application Logic | `backend/controllers/AuthController.js`, `frontend/js/auth.js` (Auth object) |
| 8 | Pengguna | Entity (Database) | Persistence | `backend/models/Pengguna.js`, tabel `pengguna` |
| 9 | Sesi | Entity (Database) | Persistence | Virtual — dikelola via JWT (jsonwebtoken), tidak ada tabel terpisah |
| 10 | Email Verifikasi | Entity (Database) | Persistence | Virtual — field `token_verifikasi` di tabel `pengguna`; token di-generate via `crypto.randomBytes(32)` |

## Klasifikasi Objek — Modul Dashboard

| No | Nama Object | Jenis / Tipe Kelas | Layer | File Implementasi |
|---|---|---|---|---|
| 1 | UI Dashboard | Boundary (Interface) | Presentation | `frontend/index.html` (P023/P024), `frontend/pages/dashboard-empty.html`, `frontend/js/dashboard.js` |
| 2 | ControllerDashboard | Controller | Application Logic | `backend/controllers/DashboardController.js`, `frontend/js/dashboard.js` (Dashboard object) |
| 3 | KonsumsiHarian | Entity (Database) | Persistence | `backend/models/KonsumsiHarian.js`, tabel `konsumsi_harian` |
| 4 | BeratBadan | Entity (Database) | Persistence | `backend/models/BeratBadan.js`, tabel `berat_badan` |
| 5 | ProfilNutrisi | Entity (Database) | Persistence | `backend/models/ProfilNutrisi.js`, tabel `profil_nutrisi` |
| 6 | RekomendasiMenu | Entity (Database) | Persistence | Virtual — dihasilkan dari MenuMakan + PreferensiPengguna |
| 7 | Pengguna | Entity (Database) | Persistence | `backend/models/Pengguna.js`, tabel `pengguna` |

### Hubungan Antar Objek — Modul Dashboard

#### 1. Presentation → Controller (HTTP Request)

| Boundary | Method | Controller Endpoint |
|---|---|---|
| UI Dashboard | `GET /dashboard` | `DashboardController.getDashboard()` |

#### 2. Controller → Entity (Database Query)

| Controller Method | Entity | Method | Tabel |
|---|---|---|---|
| `getDashboard()` | `KonsumsiHarian` | `getByUserAndDate(userId, today)` | `konsumsi_harian` |
| `getDashboard()` | `KonsumsiHarian` | `getByUserAndPeriod(userId, startDate, endDate)` | `konsumsi_harian` |
| `getDashboard()` | `BeratBadan` | `getLatest(userId)` + `getByUser(userId)` | `berat_badan` |
| `getDashboard()` | `PreferensiPengguna` | `getByUser(userId)` | `preferensi_pengguna` |

#### 3. Boundary → Boundary (Navigasi — Dashboard)

| Dari | Ke | Trigger |
|---|---|---|
| UI Dashboard | UI Pilih Waktu Makan | Tombol Catat Makanan / Catat Makanan Pertama |
| UI Dashboard | Berat Badan | Tombol Update Berat |
| UI Dashboard | Analisis | Tombol Laporan Analisis |
| UI Dashboard | Riwayat | Bottom nav Riwayat |
| UI Dashboard | Profil | Bottom nav Profil / header action icon |

## Hubungan Antar Objek — Modul Konsumsi

### 1. Presentation → Controller (HTTP Request)

| Boundary | Method | Controller Endpoint |
|---|---|---|
| UI Pilih Makanan | `GET /konsumsi/search?keyword=` | `KonsumsiController.searchMakanan()` |
| UI Pilih Makanan / UI Catat Manual | `POST /konsumsi/simpan` | `KonsumsiController.simpanKonsumsi()` |
| UI Data Tersimpan | (diterima response dari POST) | — |

### 2. Controller → Entity (Database Query)

| Controller Method | Entity | Method | Tabel |
|---|---|---|---|
| `searchMakanan()` | `MenuMakan` | `search(keyword)` / `getAll()` | `menu_makanan` |
| `simpanKonsumsi()` | `KonsumsiHarian` | `create(data)` | `konsumsi_harian` |

### 3. Boundary → Boundary (Navigasi — Konsumsi)

| Dari | Ke | Trigger |
|---|---|---|
| UI Pilih Waktu Makan | UI Pilih Makanan | Tombol LANJUT |
| UI Pilih Waktu Makan | UI Catat Manual | Tombol Catat Manual (pada P002) |
| UI Pilih Makanan / UI Catat Manual | UI Data Tersimpan | Response sukses dari Controller (via `showDataTersimpan`) |
| UI Data Tersimpan | UI Pilih Waktu Makan | Tombol TAMBAH LAGI |
| UI Data Tersimpan | Dashboard | Tombol KE BERANDA |

## Hubungan Antar Objek — Modul Rekomendasi

### 1. Presentation → Controller (HTTP Request)

| Boundary | Method | Controller Endpoint |
|---|---|---|
| UI Rekomendasi Menu / UI Menu Rekomendasi | `GET /rekomendasi` | `RekomendasiController.getRekomendasi()` |
| UI Atur Preferensi | `POST /rekomendasi/preferensi` | `RekomendasiController.simpanPreferensi()` |
| UI Preferensi Anda | `GET /rekomendasi/preferensi` | `RekomendasiController.getPreferensi()` |

### 2. Controller → Entity (Database Query)

| Controller Method | Entity | Method | Tabel |
|---|---|---|---|
| `getRekomendasi()` | `PreferensiPengguna` | `getByUser(userId)` | `preferensi_pengguna` |
| `getRekomendasi()` | `KonsumsiHarian` | `getByUserAndDate(userId, today)` | `konsumsi_harian` |
| `getRekomendasi()` | `MenuMakan` | `getAll()` | `menu_makanan` |
| `simpanPreferensi()` | `PreferensiPengguna` | `upsert(userId, data)` | `preferensi_pengguna` |
| `getPreferensi()` | `PreferensiPengguna` | `getByUser(userId)` | `preferensi_pengguna` |

### 3. Boundary → Boundary (Navigasi — Rekomendasi)

| Dari | Ke | Trigger |
|---|---|---|
| UI Rekomendasi Menu | UI Menu Rekomendasi | Tombol BERIKAN REKOMENDASI |
| UI Preferensi Anda | UI Atur Preferensi | Tombol ATUR PREFERENSI |
| UI Atur Preferensi | UI Rekomendasi Menu | Response sukses simpan preferensi (via `showRekomendasi`) |
| UI Preferensi Anda | Dashboard | Link "Lewati, lanjutkan tanpa preferensi" |

### Hubungan Antar Objek — Modul Autentikasi

#### 1. Presentation → Controller (HTTP Request)

| Boundary | Method | Controller Endpoint |
|---|---|---|
| UI Sign In Sign Up | `POST /auth/login` | `AuthController.login()` |
| UI Daftar Akun | `POST /auth/register` | `AuthController.register()` |
| UI Verifikasi Email | `GET /auth/verify-email/:token` | `AuthController.verifyEmail()` |

#### 2. Controller → Entity (Database Query)

| Controller Method | Entity | Method | Tabel |
|---|---|---|---|
| `login()` | `Pengguna` | `findByEmail(email)` | `pengguna` |
| `register()` | `Pengguna` | `findByEmail(email)` + `create(data)` | `pengguna` |
| `verifyEmail()` | `Pengguna` | `verifyEmail(token)` | `pengguna` |

#### 3. Boundary → Boundary (Navigasi — Autentikasi)

| Dari | Ke | Trigger |
|---|---|---|
| UI Splash Screen | UI Sign In Sign Up | Tombol MASUK |
| UI Splash Screen | UI Daftar Akun | Tombol DAFTAR (via tab Sign Up) |
| UI Sign In Sign Up | Dashboard | Response sukses login |
| UI Daftar Akun | UI Verifikasi Email | Response sukses register |
| UI Verifikasi Email | UI Selamat Datang | Link verifikasi (dari email) |
| UI Selamat Datang | Dashboard | Form login sukses |

## Alur Autentikasi: Register & Login

```
User → UI Splash Screen (P011)
         ↓ Tombol MASUK
UI Splash Screen → UI Sign In Sign Up (P012)
         ↓ [atau]
User → UI Splash Screen (P011)
         ↓ Tombol DAFTAR
UI Splash Screen → UI Daftar Akun (P013, tab Sign Up)
         ↓ User isi form (nama, email, password, konfirmasi)
         ↓ Klik DAFTAR
UI Daftar Akun → ControllerAuth: POST /auth/register
         ↓
ControllerAuth → Pengguna: findByEmail(email) → cek duplikasi
ControllerAuth → Pengguna: create({ nama, email, password_hash, token_verifikasi })
         ↓ INSERT INTO pengguna (...)
Pengguna → ControllerAuth: { id, tokenVerifikasi }
         ↓ Generate JWT token
ControllerAuth → UI Daftar Akun: { success: true, data: { token, user } }
         ↓ Redirect ke UI Verifikasi Email (P014)
UI Verifikasi Email → Pengguna: (email berisi link verifikasi /auth/verify-email/:token)
         ↓ User klik link verifikasi
ControllerAuth → Pengguna: verifyEmail(token)
         ↓ UPDATE pengguna SET email_terverifikasi = 1
Pengguna → ControllerAuth: { id, nama, email }
ControllerAuth → UI Selamat Datang (P015): { success: true }
         ↓ User isi email & password
UI Selamat Datang → ControllerAuth: POST /auth/login
ControllerAuth → Pengguna: findByEmail(email)
ControllerAuth → Pengguna: bcrypt.compare(password, hash)
Pengguna → ControllerAuth: user
ControllerAuth → UI Selamat Datang: { success: true, data: { token, user } }
         ↓ Redirect ke Dashboard (P016 / P016a)
```

```
User → UI Pilih Waktu Makan (P002)
         ↓ Pilih waktu makan (Sarapan/Siang/Malam)
         ↓ Klik LANJUT
UI Pilih Waktu Makan → UI Pilih Makanan (P003)
         ↓ User input keyword pencarian
UI Pilih Makanan → ControllerKonsumsi: GET /konsumsi/search
         ↓
ControllerKonsumsi → MenuMakan: search(keyword)
         ↓ Query: SELECT * FROM menu_makanan WHERE nama_makanan LIKE '%keyword%'
MenuMakan → ControllerKonsumsi: [rows]
         ↓
ControllerKonsumsi → UI Pilih Makanan: { data: [...] }
         ↓ User pilih makanan dan atur porsi
UI Pilih Makanan → ControllerKonsumsi: POST /konsumsi/simpan
         ↓
ControllerKonsumsi → KonsumsiHarian: create({ userId, menuId, porsi, kalori, ... })
         ↓ INSERT INTO konsumsi_harian (...)
KonsumsiHarian → ControllerKonsumsi: insertId
         ↓
ControllerKonsumsi → UI Data Tersimpan (P006): { success: true, data }
         ↓ Tampilkan konfirmasi "Berhasil Disimpan!"
```

## Alur B: Catat Manual

```
User → UI Pilih Waktu Makan (P002)
         ↓ Pilih waktu makan
         ↓ Klik "Catat Manual" (pada P002)
UI Pilih Waktu Makan → UI Catat Manual (P004)
         ↓ User isi form (nama, kalori, protein, lemak, karbohidrat)
         ↓ Klik SIMPAN
UI Catat Manual → ControllerKonsumsi: POST /konsumsi/simpan
         ↓
ControllerKonsumsi → KonsumsiHarian: create({ userId, nama_makanan, kalori, ... })
         ↓ INSERT INTO konsumsi_harian (...)
KonsumsiHarian → ControllerKonsumsi: insertId
         ↓
ControllerKonsumsi → UI Data Tersimpan (P006): { success: true, data }
         ↓ Tampilkan konfirmasi "Berhasil Disimpan!"
```

## Alur C: Rekomendasi Menu

```
User → UI Rekomendasi Menu (P007)
         ↓ Klik BERIKAN REKOMENDASI
UI Rekomendasi Menu → ControllerRekomendasi: GET /rekomendasi
         ↓
ControllerRekomendasi → PreferensiPengguna: getByUser(userId)
         ↓ SELECT * FROM preferensi_pengguna WHERE user_id = ?
PreferensiPengguna → ControllerRekomendasi: { preferensi_makan, target_kalori, ... }
         ↓
ControllerRekomendasi → KonsumsiHarian: getByUserAndDate(userId, today)
         ↓ SELECT konsumsi_harian + JOIN menu_makanan
KonsumsiHarian → ControllerRekomendasi: todayConsumption
         ↓
ControllerRekomendasi → MenuMakan: getAll()
         ↓ SELECT * FROM menu_makanan
MenuMakan → ControllerRekomendasi: allMenus
         ↓
ControllerRekomendasi → [Filter & Sort]:
          1. Hitung sisaKalori = targetKalori - totalKaloriTerpakai
          2. Filter menu by sisa kalori & preferensi_makan
          3. Sort by closest to sisa kalori
          4. Ambil top 20
         ↓
ControllerRekomendasi → Menu Rekomendasi (data):
          { sisaKalori, targetKalori, rekomendasi: [...] }
         ↓
Menu Rekomendasi → User: Tampilkan kalori bar + daftar rekomendasi per kategori

User → UI Preferensi Anda (P008)
         ↓ Klik ATUR PREFERENSI
UI Preferensi Anda → UI Atur Preferensi (P009)
         ↓ User isi tujuan diet, preferensi makan, target kalori, alergi
         ↓ Klik SIMPAN PREFERENSI
UI Atur Preferensi → ControllerRekomendasi: POST /rekomendasi/preferensi
         ↓
ControllerRekomendasi → PreferensiPengguna: upsert(userId, { tujuan, preferensi_makan, ... })
         ↓ INSERT / UPDATE preferensi_pengguna
PreferensiPengguna → ControllerRekomendasi: { id / updated }
         ↓
ControllerRekomendasi → UI Atur Preferensi: { success: true }
         ↓ Redirect ke rekomendasi

User → UI Menu Rekomendasi (P010)
         ↓ Lihat Top 3 Best Match untuk Makan Siang
         ↓ Klik Catat Pilihan
UI Menu Rekomendasi → ControllerKonsumsi: POST /konsumsi/simpan
         ↓
ControllerKonsumsi → KonsumsiHarian: create({ userId, menuId, ... })
KonsumsiHarian → ControllerKonsumsi: insertId
ControllerKonsumsi → UI Menu Rekomendasi: { success: true }
```

## Catatan

- **P005 (Detail Konsumsi)** tidak termasuk dalam klasifikasi modul Konsumsi karena dianggap sebagai bagian dari logika UI Pilih Makanan (adjust porsi terjadi sebelum simpan).
- **RekomendasiMenu** adalah entity virtual — tidak memiliki tabel atau model terpisah. Data rekomendasi dihasilkan secara komputasional oleh `RekomendasiController.getRekomendasi()` dengan mengkombinasikan data dari MenuMakan, PreferensiPengguna, dan KonsumsiHarian.
- **Frontend Konsumsi object** (`frontend/js/konsumsi.js`) bertindak sebagai Controller sisi klien — mengatur navigasi, state (selectedWaktu, selectedMenu, selectedPorsi), dan komunikasi HTTP ke backend.
- **Frontend Rekomendasi object** (`frontend/js/rekomendasi.js`) bertindak sebagai Controller sisi klien — mengatur state preferensi, render menu rekomendasi, dan komunikasi HTTP ke backend.
- **Backend ControllerRekomendasi** (`backend/controllers/RekomendasiController.js`) menangani logika bisnis rekomendasi termasuk filtering, sorting, dan kalkulasi sisa kalori.
- **ProfilNutrisi** digunakan oleh modul Dashboard untuk perhitungan target kalori, yang kemudian dipakai oleh ControllerRekomendasi sebagai referensi target kalori pengguna.
