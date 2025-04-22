const db = require('../config/db');

const createYoutubeResource = async (title, url, videoId) => {
  const result = await db.query(
    'INSERT INTO youtube_resources (title, url, video_id) VALUES ($1, $2, $3) RETURNING *',
    [title, url, videoId]
  );
  return result.rows[0];
};

const getAllYoutubeResources = async () => {
  const result = await db.query('SELECT * FROM youtube_resources ORDER BY created_at DESC');
  return result.rows;
};

const deleteYoutubeResource = async (id) => {
  await db.query('DELETE FROM youtube_resources WHERE id = $1', [id]);
};

module.exports = {
  createYoutubeResource,
  getAllYoutubeResources,
  deleteYoutubeResource,
};