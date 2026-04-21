const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllPenyewa = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const searchValue = `%${q}%`;
    
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM penyewa p 
       JOIN users u ON p.id_user = u.id 
       WHERE u.nama LIKE ? OR u.email LIKE ?`,
      [searchValue, searchValue]
    );
    const total = countResult[0].total;
    
    const [rows] = await db.query(
      `SELECT p.*, u.nama as nama_user, u.email, k.nomor_kamar, kos.nama_kos 
       FROM penyewa p 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE u.nama LIKE ? OR u.email LIKE ? 
       LIMIT ? OFFSET ?`,
      [searchValue, searchValue, parseInt(limit), parseInt(offset)]
    );
    
    successResponse(res, 200, 'Data penyewa berhasil diambil', {
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

exports.getPenyewaById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.nama as nama_user, u.email, k.nomor_kamar, kos.nama_kos 
       FROM penyewa p 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Penyewa tidak ditemukan');
    }
    successResponse(res, 200, 'Data penyewa berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.createPenyewa = async (req, res) => {
  try {
    const { id_user, id_kamar, tanggal_masuk, tanggal_keluar } = req.body;
    if (!id_user || !id_kamar || !tanggal_masuk) {
      return errorResponse(res, 400, 'ID user, ID kamar, dan tanggal masuk wajib diisi');
    }
    
    // Validasi user dan kamar
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id_user]);
    if (user.length === 0) return errorResponse(res, 400, 'ID user tidak valid');
    
    const [kamar] = await db.query('SELECT * FROM kamar WHERE id = ?', [id_kamar]);
    if (kamar.length === 0) return errorResponse(res, 400, 'ID kamar tidak valid');
    
    const [result] = await db.query(
      'INSERT INTO penyewa (id_user, id_kamar, tanggal_masuk, tanggal_keluar) VALUES (?, ?, ?, ?)',
      [id_user, id_kamar, tanggal_masuk, tanggal_keluar || null]
    );
    
    const [newPenyewa] = await db.query(
      `SELECT p.*, u.nama as nama_user, u.email, k.nomor_kamar, kos.nama_kos 
       FROM penyewa p 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE p.id = ?`,
      [result.insertId]
    );
    successResponse(res, 201, 'Penyewa berhasil ditambahkan', newPenyewa[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.updatePenyewa = async (req, res) => {
  try {
    const { id_user, id_kamar, tanggal_masuk, tanggal_keluar } = req.body;
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM penyewa WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Penyewa tidak ditemukan');
    }
    
    if (id_user) {
      const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id_user]);
      if (user.length === 0) return errorResponse(res, 400, 'ID user tidak valid');
    }
    if (id_kamar) {
      const [kamar] = await db.query('SELECT * FROM kamar WHERE id = ?', [id_kamar]);
      if (kamar.length === 0) return errorResponse(res, 400, 'ID kamar tidak valid');
    }
    
    await db.query(
      'UPDATE penyewa SET id_user = ?, id_kamar = ?, tanggal_masuk = ?, tanggal_keluar = ? WHERE id = ?',
      [id_user, id_kamar, tanggal_masuk, tanggal_keluar, id]
    );
    
    const [updated] = await db.query(
      `SELECT p.*, u.nama as nama_user, u.email, k.nomor_kamar, kos.nama_kos 
       FROM penyewa p 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE p.id = ?`,
      [id]
    );
    successResponse(res, 200, 'Penyewa berhasil diperbarui', updated[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.deletePenyewa = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM penyewa WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Penyewa tidak ditemukan');
    }
    successResponse(res, 200, 'Penyewa berhasil dihapus', null);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};