const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pengguna = require('../models/Pengguna');

const JWT_SECRET = process.env.JWT_SECRET || 'nutrisurvey_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const AuthController = {
  async register(req, res) {
    try {
      const { nama, email, password, tanggalLahir, jenisKelamin } = req.body;

      if (!nama || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
      }

      const existing = await Pengguna.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await Pengguna.create({
        nama,
        email,
        password: hashedPassword,
        tanggalLahir,
        jenisKelamin
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          token,
          user: {
            id: user.id,
            nama: nama,
            email: email
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      }

      const user = await Pengguna.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            emailTerverifikasi: !!user.email_terverifikasi
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const user = await Pengguna.verifyEmail(token);

      if (!user) {
        return res.status(400).json({ success: false, message: 'Token verifikasi tidak valid' });
      }

      return res.json({ success: true, message: 'Email berhasil diverifikasi' });
    } catch (error) {
      console.error('Verify email error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = AuthController;
