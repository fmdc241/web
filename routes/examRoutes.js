const express = require('express');
const path = require('path');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createNewExam,
  getExams,
  getExam,
  removeExam,
  submitExamResult,
  getUserExamResults,
  getAllResults,
  removeExamResult,
} = require('../controllers/examController');

// Protect all routes
router.use(protect);

// Only admins can create/delete exams
router.post('/', admin, createNewExam);
router.delete('/:id', admin, removeExam);

// All authenticated users can access these
router.get('/', getExams);
router.get('/:id', getExam);

// Serve PDF inline for browser viewing
router.get('/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send('PDF not found');
  });
});

module.exports = router;
