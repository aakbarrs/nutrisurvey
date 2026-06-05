require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const konsumsiRoutes = require('./routes/konsumsi');
const rekomendasiRoutes = require('./routes/rekomendasi');
const beratBadanRoutes = require('./routes/beratBadan');
const laporanRoutes = require('./routes/laporan');
const notifikasiRoutes = require('./routes/notifikasi');
const profilRoutes = require('./routes/profil');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/konsumsi', konsumsiRoutes);
app.use('/api/rekomendasi', rekomendasiRoutes);
app.use('/api/berat-badan', beratBadanRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/profil', profilRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NutriSurvey API is running' });
});

app.listen(PORT, () => {
  console.log(`NutriSurvey API server running on port ${PORT}`);
});
