const multer = require('multer');
const path = require('path');
const { createExam, getAllExams, getExamById, deleteExam } = require('../models/examModel');
const { createExamResult, getExamResultsByUser, getAllExamResults, deleteExamResult } = require('../models/examResultModel');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}).single('pdf');

const createNewExam = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { title, description, questionCount, correctAnswers } = req.body;
    const pdfUrl = `/uploads/${req.file.filename}`;

    try {
      const exam = await createExam(
        title, 
        description, 
        pdfUrl, 
        req.file.originalname, 
        questionCount,
        JSON.parse(correctAnswers) // Parse the correctAnswers string back into an object
      );
      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
};

const getExams = async (req, res) => {
  try {
    const exams = await getAllExams();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getExam = async (req, res) => {
  try {
    const exam = await getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeExam = async (req, res) => {
  try {
    await deleteExam(req.params.id);
    res.json({ message: 'Exam removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitExamResult = async (req, res) => {
  const examId = req.params.id;
  const userAnswers = req.body.answers;
  const userId = req.user.id;

  if (!examId || !userAnswers) {
    return res.status(400).json({ message: 'Missing examId or answers' });
  }

  try {
    // 1. Get the exam with correct answers
    const exam = await getExamById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // 2. Get correct answers (already parsed as JSON in model)
    const correctAnswers = exam.correct_answers;
    if (!correctAnswers || typeof correctAnswers !== 'object') {
      return res.status(500).json({ message: 'Exam has invalid correct answers format' });
    }

    // 3. Calculate score
    let correctCount = 0;
    const totalQuestions = Object.keys(correctAnswers).length;

    for (let i = 1; i <= totalQuestions; i++) {
      if (userAnswers[i] && userAnswers[i] === correctAnswers[i]) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    // 4. Save result with both answer sets
    const result = await createExamResult(
      examId,
      userId,
      score,
      userAnswers,       // user's answers
      correctAnswers     // correct answers
    );

    res.status(201).json({
      success: true,
      score: score,
      correct: correctCount,
      total: totalQuestions,
      percentage: score
    });

  } catch (error) {
    console.error('Exam submission error:', error);
    res.status(500).json({ 
      message: 'Server error during exam submission',
      error: error.message 
    });
  }
};

// Helper function if userAnswers comes as array
function arrayToAnswerObject(answerArray) {
  const answerObj = {};
  answerArray.forEach((answer, index) => {
    answerObj[index + 1] = answer; // Convert 0-based array to 1-based question numbers
  });
  return answerObj;
}

const getUserExamResults = async (req, res) => {
  try {
    const results = await getExamResultsByUser(req.user.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await getAllExamResults();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeExamResult = async (req, res) => {
  try {
    await deleteExamResult(req.params.id);
    res.json({ message: 'Exam result removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createNewExam,
  getExams,
  getExam,
  removeExam,
  submitExamResult,
  getUserExamResults,
  getAllResults,
  removeExamResult,

};