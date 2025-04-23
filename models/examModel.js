const db = require('../config/db');

// Function to create a new exam
const createExam = async (title, description, pdfUrl, pdfName, questionCount, correctAnswers) => {
  const result = await db.query(
    'INSERT INTO exams (title, description, pdf_url, pdf_name, question_count, correct_answers) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, pdfUrl, pdfName, questionCount, JSON.stringify(correctAnswers)]
  );
  return result.rows[0];
};

// Function to get all exams
const getAllExams = async () => {
  const result = await db.query('SELECT * FROM exams ORDER BY created_at DESC');
  return result.rows;
};

// Function to get a specific exam by ID
const getExamById = async (id) => {
  const result = await db.query('SELECT * FROM exams WHERE id = $1', [id]);
  return result.rows[0];
};

// Function to delete an exam by ID
const deleteExam = async (id) => {
  await db.query('DELETE FROM exams WHERE id = $1', [id]);
};

// Export all the functions
module.exports = {
  createExam,
  getAllExams,
  getExamById, // Ensure this is defined before being exported
  deleteExam,
};
