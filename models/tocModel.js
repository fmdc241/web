const db = require('../config/db');

const createTocItem = async (category, topic, linkUrl) => {
  const result = await db.query(
    'INSERT INTO toc_items (category, topic, link_url) VALUES ($1, $2, $3) RETURNING *',
    [category, topic, linkUrl]
  );
  return result.rows[0];
};

const getAllTocItems = async () => {
  const result = await db.query('SELECT * FROM toc_items ORDER BY category, topic');
  return result.rows;
};

const deleteTocItem = async (id) => {
  await db.query('DELETE FROM toc_items WHERE id = $1', [id]);
};

const updateTocCategory = async (oldCategory, newCategory) => {
  await db.query('UPDATE toc_items SET category = $1 WHERE category = $2', [newCategory, oldCategory]);
};

const deleteTocCategory = async (category) => {
  await db.query('DELETE FROM toc_items WHERE category = $1', [category]);
};

module.exports = {
  createTocItem,
  getAllTocItems,
  deleteTocItem,
  updateTocCategory,
  deleteTocCategory,
};
