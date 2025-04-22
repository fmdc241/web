const db = require('../config/db');

const createExamResult = async (examId, userId, score, userAnswers, correctAnswers) => {
  const result = await db.query(
    `INSERT INTO exam_results 
     (exam_id, user_id, score, user_answers, correct_answers) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [
      examId, 
      userId, 
      score, 
      JSON.stringify(userAnswers),
      JSON.stringify(correctAnswers)
    ]
  );
  return result.rows[0];
};
const getExamResultsByUser = async (userId) => {
  const result = await db.query(
    'SELECT er.*, e.title as exam_title FROM exam_results er JOIN exams e ON er.exam_id = e.id WHERE er.user_id = $1 ORDER BY er.created_at DESC',
    [userId]
  );
  return result.rows;
};

const getAllExamResults = async () => {
  const result = await db.query(
    'SELECT er.*, e.title as exam_title, u.full_name as student_name FROM exam_results er JOIN exams e ON er.exam_id = e.id JOIN users u ON er.user_id = u.id ORDER BY er.created_at DESC'
  );
  return result.rows;
};

const deleteExamResult = async (id) => {
  await db.query('DELETE FROM exam_results WHERE id = $1', [id]);
};

module.exports = {
  createExamResult,
  getExamResultsByUser,
  getAllExamResults,
  deleteExamResult,
};