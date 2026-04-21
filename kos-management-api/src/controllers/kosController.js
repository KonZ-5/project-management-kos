const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllKos = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const searchValue = `%${q}%`;
    
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM kos WHERE nama_kos LIKE ? OR alamat LIKE ?',
      [searchValue, searchValue]
    );
    const total = countResult[0].total;
    
    const [rows] = await db.query(
      'SELECT * FROM kos WHERE nama_kos LIKE ? OR alamat LIKE ? LIMIT ? OFFSET ?',
      [searchValue, searchValue, parseInt(limit), parseInt(offset)]
    );
    
    successResponse(res, 200, 'Data kos berhasil diambil', {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.getKosById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Kos tidak ditemukan');
    }
    successResponse(res, 200, 'Data kos berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.createKos = async (req, res) => {
  try {
    const { nama_kos, alamat, jumlah_kamar, fasilitas } = req.body;
    if (!nama_kos || !alamat || !jumlah_kamar) {
      return errorResponse(res, 400, 'Nama kos, alamat, dan jumlah kamar wajib diisi');
    }
    
    const [result] = await db.query(
      'INSERT INTO kos (nama_kos, alamat, jumlah_kamar, fasilitas) VALUES (?, ?, ?, ?)',
      [nama_kos, alamat, jumlah_kamar, fasilitas || null]
    );
    
    const [newKos] = await db.query('SELECT * FROM kos WHERE id = ?', [result.insertId]);
    successResponse(res, 201, 'Kos berhasil ditambahkan', newKos[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.updateKos = async (req, res) => {
  try {
    const { nama_kos, alamat, jumlah_kamar, fasilitas } = req.body;
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM kos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Kos tidak ditemukan');
    }
    
    await db.query(
      'UPDATE kos SET nama_kos = ?, alamat = ?, jumlah_kamar = ?, fasilitas = ? WHERE id = ?',
      [nama_kos, alamat, jumlah_kamar, fasilitas, id]
    );
    
    const [updated] = await db.query('SELECT * FROM kos WHERE id = ?', [id]);
    successResponse(res, 200, 'Kos berhasil diperbarui', updated[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.deleteKos = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM kos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Kos tidak ditemukan');
    }
    successResponse(res, 200, 'Kos berhasil dihapus', null);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};