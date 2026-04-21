const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET all users with query filter & pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM users WHERE nama LIKE ? OR email LIKE ?';
    const searchValue = `%${q}%`;
    const countQuery = 'SELECT COUNT(*) as total FROM users WHERE nama LIKE ? OR email LIKE ?';
    
    const [countResult] = await db.query(countQuery, [searchValue, searchValue]);
    const total = countResult[0].total;
    
    const [rows] = await db.query(
      query + ' LIMIT ? OFFSET ?',
      [searchValue, searchValue, parseInt(limit), parseInt(offset)]
    );
    
    successResponse(res, 200, 'Data users berhasil diambil', {
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

// GET user by id
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }
    successResponse(res, 200, 'Data user berhasil  diambil', rows[0]);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

// POST create user
exports.createUser = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    
    // Validasi sederhana
    if (!nama || !email || !password) {
      return errorResponse(res, 400, 'Nama, email, dan password wajib diisi');
    }
    
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, password, role || 'penyewa']
    );
    
    const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    successResponse(res, 201, 'User berhasil ditambahkan', newUser[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 400, 'Email sudah digunakan');
    }
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    const { id } = req.params;
    
    // Cek apakah user ada
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }
    
    await db.query(
      'UPDATE users SET nama = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [nama, email, password, role, id]
    );
    
    const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    successResponse(res, 200, 'User berhasil diperbarui', updated[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 400, 'Email sudah digunakan');
    }
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }
    successResponse(res, 200, 'User berhasil dihapus', null);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, 'Terjadi kesalahan server');
  }
};