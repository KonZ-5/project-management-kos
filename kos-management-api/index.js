const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./src/routes/userRoutes');
const kosRoutes = require('./src/routes/kosRoutes');
const kamarRoutes = require('./src/routes/kamarRoutes');
const penyewaRoutes = require('./src/routes/penyewaRoutes');
const pembayaranRoutes = require('./src/routes/pembayaranRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/kos', kosRoutes);
app.use('/kamar', kamarRoutes);
app.use('/penyewa', penyewaRoutes);
app.use('/pembayaran', pembayaranRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Selamat datang di API Sistem Manajemen Kos',
    endpoints: {
      users: '/users',
      kos: '/kos',
      kamar: '/kamar',
      penyewa: '/penyewa',
      pembayaran: '/pembayaran'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan server'
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});