const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (username, password, fullName, email, address, isAdmin = false) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO users (username, password, full_name, email, address, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [username, hashedPassword, fullName, email, address, isAdmin]
  );
  return result.rows[0];
};

const getUserByUsername = async (username) => {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await db.query('SELECT id, username, full_name, email, address, is_admin FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await db.query('SELECT id, username, full_name, email, address, is_admin, created_at FROM users WHERE is_admin = false');
  return result.rows;
};

const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  getAllUsers,
  deleteUser,
};
