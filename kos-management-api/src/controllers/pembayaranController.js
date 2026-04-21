const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllPembayaran = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const searchValue = `%${q}%`;
    
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM pembayaran pb 
       JOIN penyewa p ON pb.id_penyewa = p.id 
       JOIN users u ON p.id_user = u.id 
       WHERE u.nama LIKE ? OR pb.status LIKE ?`,
      [searchValue, searchValue]
    );
    const total = countResult[0].total;
    
    const [rows] = await db.query(
      `SELECT pb.*, u.nama as nama_penyewa, k.nomor_kamar, kos.nama_kos 
       FROM pembayaran pb 
       JOIN penyewa p ON pb.id_penyewa = p.id 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE u.nama LIKE ? OR pb.status LIKE ? 
       LIMIT ? OFFSET ?`,
      [searchValue, searchValue, parseInt(limit), parseInt(offset)]
    );
    
    successResponse(res, 200, 'Data pembayaran berhasil diambil', {
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

exports.getPembayaranById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pb.*, u.nama as nama_penyewa, k.nomor_kamar, kos.nama_kos 
       FROM pembayaran pb 
       JOIN penyewa p ON pb.id_penyewa = p.id 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE pb.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Pembayaran tidak ditemukan');
    }
    successResponse(res, 200, 'Data pembayaran berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.createPembayaran = async (req, res) => {
  try {
    const { id_penyewa, jumlah_bayar, tanggal_bayar, status } = req.body;
    if (!id_penyewa || !jumlah_bayar || !tanggal_bayar) {
      return errorResponse(res, 400, 'ID penyewa, jumlah bayar, dan tanggal bayar wajib diisi');
    }
    
    const [penyewa] = await db.query('SELECT * FROM penyewa WHERE id = ?', [id_penyewa]);
    if (penyewa.length === 0) {
      return errorResponse(res, 400, 'ID penyewa tidak valid');
    }
    
    const [result] = await db.query(
      'INSERT INTO pembayaran (id_penyewa, jumlah_bayar, tanggal_bayar, status) VALUES (?, ?, ?, ?)',
      [id_penyewa, jumlah_bayar, tanggal_bayar, status || 'belum lunas']
    );
    
    const [newPembayaran] = await db.query(
      `SELECT pb.*, u.nama as nama_penyewa, k.nomor_kamar, kos.nama_kos 
       FROM pembayaran pb 
       JOIN penyewa p ON pb.id_penyewa = p.id 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE pb.id = ?`,
      [result.insertId]
    );
    successResponse(res, 201, 'Pembayaran berhasil ditambahkan', newPembayaran[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.updatePembayaran = async (req, res) => {
  try {
    const { id_penyewa, jumlah_bayar, tanggal_bayar, status } = req.body;
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM pembayaran WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Pembayaran tidak ditemukan');
    }
    
    if (id_penyewa) {
      const [penyewa] = await db.query('SELECT * FROM penyewa WHERE id = ?', [id_penyewa]);
      if (penyewa.length === 0) return errorResponse(res, 400, 'ID penyewa tidak valid');
    }
    
    await db.query(
      'UPDATE pembayaran SET id_penyewa = ?, jumlah_bayar = ?, tanggal_bayar = ?, status = ? WHERE id = ?',
      [id_penyewa, jumlah_bayar, tanggal_bayar, status, id]
    );
    
    const [updated] = await db.query(
      `SELECT pb.*, u.nama as nama_penyewa, k.nomor_kamar, kos.nama_kos 
       FROM pembayaran pb 
       JOIN penyewa p ON pb.id_penyewa = p.id 
       JOIN users u ON p.id_user = u.id 
       JOIN kamar k ON p.id_kamar = k.id 
       JOIN kos ON k.id_kos = kos.id 
       WHERE pb.id = ?`,
      [id]
    );
    successResponse(res, 200, 'Pembayaran berhasil diperbarui', updated[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

exports.deletePembayaran = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pembayaran WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Pembayaran tidak ditemukan');
    }
    successResponse(res, 200, 'Pembayaran berhasil dihapus', null);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};