const db = require('./src/config/db');

db.query('SELECT 1 + 1 AS result')
  .then(([rows]) => {
    console.log('Koneksi database berhasil!', rows[0].result);
    process.exit();
  })
  .catch(err => {
    console.error('Koneksi database gagal:', err.message);
    process.exit(1);
  });