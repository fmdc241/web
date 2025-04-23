const db = require('../config/db');

const createExam = async (title, description, pdfUrl, pdfName, questionCount, correctAnswers) => {
  const result = await db.query(
    'INSERT INTO exams (title, description, pdf_url, pdf_name, question_count, correct_answers) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, pdfUrl, pdfName, questionCount, JSON.stringify(correctAnswers)]
  );
  return result.rows[0];
};

const getAllExams = async () => {
  const result = await db.query('SELECT * FROM exams ORDER BY created_at DESC');
  return result.rows;
};

module.exports = {
  createExam,
  getAllExams, // Ensure this is exported
  getExamById,
  deleteExam,
};
const getExamById = async (id) => {
  const result = await db.query('SELECT * FROM exams WHERE id = $1', [id]);
  return result.rows[0];
};

const deleteExam = async (id) => {
  await db.query('DELETE FROM exams WHERE id = $1', [id]);
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  deleteExam,
};
