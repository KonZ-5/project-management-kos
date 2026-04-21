const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllKamar = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const searchValue = `%${q}%`;
    
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM kamar WHERE nomor_kamar LIKE ?',
      [searchValue]
    );
    const total = countResult[0].total;
    
    const [rows] = await db.query(
      `SELECT k.*, kos.nama_kos 
       FROM kamar k 
       JOIN kos ON k.id_kos = kos.id 
       WHERE k.nomor_kamar LIKE ? 
       LIMIT ? OFFSET ?`,
      [searchValue, parseInt(limit), parseInt(offset)]
    );
    
    successResponse(res, 200, 'Data kamar berhasil diambil', {
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

exports.getKamarById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT k.*, kos.nama_kos 
       FROM kamar k 
       JOIN kos ON k.id_kos = kos.id 
       WHERE k.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Kamar tidak ditemukan');
    }
    successResponse(res, 200, 'Data kamar berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.createKamar = async (req, res) => {
  try {
    const { id_kos, nomor_kamar, harga, status } = req.body;
    if (!id_kos || !nomor_kamar || !harga) {
      return errorResponse(res, 400, 'ID kos, nomor kamar, dan harga wajib diisi');
    }
    
    // Validasi id_kos ada
    const [kos] = await db.query('SELECT * FROM kos WHERE id = ?', [id_kos]);
    if (kos.length === 0) {
      return errorResponse(res, 400, 'ID kos tidak valid');
    }
    
    const [result] = await db.query(
      'INSERT INTO kamar (id_kos, nomor_kamar, harga, status) VALUES (?, ?, ?, ?)',
      [id_kos, nomor_kamar, harga, status || 'tersedia']
    );
    
    const [newKamar] = await db.query(
      `SELECT k.*, kos.nama_kos 
       FROM kamar k 
       JOIN kos ON k.id_kos = kos.id 
       WHERE k.id = ?`,
      [result.insertId]
    );
    successResponse(res, 201, 'Kamar berhasil ditambahkan', newKamar[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.updateKamar = async (req, res) => {
  try {
    const { id_kos, nomor_kamar, harga, status } = req.body;
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM kamar WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Kamar tidak ditemukan');
    }
    
    // Validasi id_kos jika diubah
    if (id_kos) {
      const [kos] = await db.query('SELECT * FROM kos WHERE id = ?', [id_kos]);
      if (kos.length === 0) {
        return errorResponse(res, 400, 'ID kos tidak valid');
      }
    }
    
    await db.query(
      'UPDATE kamar SET id_kos = ?, nomor_kamar = ?, harga = ?, status = ? WHERE id = ?',
      [id_kos, nomor_kamar, harga, status, id]
    );
    
    const [updated] = await db.query(
      `SELECT k.*, kos.nama_kos 
       FROM kamar k 
       JOIN kos ON k.id_kos = kos.id 
       WHERE k.id = ?`,
      [id]
    );
    successResponse(res, 200, 'Kamar berhasil diperbarui', updated[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.deleteKamar = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM kamar WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Kamar tidak ditemukan');
    }
    successResponse(res, 200, 'Kamar berhasil dihapus', null);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};