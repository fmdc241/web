const multer = require('multer');
const path = require('path');
const { createExam, getAllExams, getExamById, deleteExam } = require('../models/examModel');
const { createExamResult, getExamResultsByUser, getAllExamResults, deleteExamResult } = require('../models/examResultModel');

// Configure multer with better error handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `exam-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only PDF files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
}).single('pdf');

const createNewExam = async (req, res) => {
  try {
    // Validate admin role
    if (!req.user?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    // Validate body parameters
    const required = ['title', 'description', 'questionCount', 'correctAnswers'];
    const missing = required.filter(field => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missing.join(', ')}`
      });
    }

    // Parse answers
    let answers;
    try {
      answers = JSON.parse(req.body.correctAnswers);
      if (typeof answers !== 'object' || Array.isArray(answers)) {
        throw new Error('Invalid format');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'correctAnswers must be a valid JSON object'
      });
    }

    // Create exam
    const exam = await createExam({
      title: req.body.title,
      description: req.body.description,
      pdfUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      questionCount: parseInt(req.body.questionCount),
      correctAnswers: answers,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        pdfUrl: exam.pdfUrl
      }
    });

  } catch (error) {
    console.error('Exam creation failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Exam creation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const getExams = async (req, res) => {
  try {
    const exams = await getAllExams();
    res.json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exams'
    });
  }
};

const getExam = async (req, res) => {
  try {
    const exam = await getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    res.json({
      success: true,
      exam
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam'
    });
  }
};

const removeExam = async (req, res) => {
  try {
    const exam = await getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    await deleteExam(req.params.id);
    console.log(`Exam deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete exam'
    });
  }
};

const submitExamResult = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const { answers: userAnswers } = req.body;
    const { id: userId } = req.user;

    // Validate input
    if (!examId || !userAnswers) {
      return res.status(400).json({
        success: false,
        error: 'Missing examId or answers'
      });
    }

    // Get exam with correct answers
    const exam = await getExamById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Validate answer formats
    const correctAnswers = exam.correct_answers;
    if (!correctAnswers || typeof correctAnswers !== 'object') {
      return res.status(500).json({
        success: false,
        error: 'Invalid exam configuration'
      });
    }

    // Convert answers to object if array
    const processedAnswers = Array.isArray(userAnswers) 
      ? arrayToAnswerObject(userAnswers)
      : userAnswers;

    // Calculate score
    let correctCount = 0;
    const totalQuestions = Object.keys(correctAnswers).length;
    const answerComparison = {};

    for (let i = 1; i <= totalQuestions; i++) {
      const isCorrect = processedAnswers[i] && processedAnswers[i] === correctAnswers[i];
      answerComparison[i] = {
        userAnswer: processedAnswers[i],
        correctAnswer: correctAnswers[i],
        isCorrect
      };
      if (isCorrect) correctCount++;
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    // Save result
    const result = await createExamResult({
      examId,
      userId,
      score,
      userAnswers: processedAnswers,
      correctAnswers,
      answerDetails: answerComparison
    });

    res.status(201).json({
      success: true,
      score,
      correct: correctCount,
      total: totalQuestions,
      percentage: score,
      resultId: result.id
    });

  } catch (error) {
    console.error('Exam submission error:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      error: 'Exam submission failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions
function arrayToAnswerObject(answerArray) {
  return answerArray.reduce((obj, answer, index) => {
    obj[index + 1] = answer; // Convert to 1-based index
    return obj;
  }, {});
}

const getUserExamResults = async (req, res) => {
  try {
    const results = await getExamResultsByUser(req.user.id);
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
};

const getAllResults = async (req, res) => {
  try {
    // Add pagination for production
    const results = await getAllExamResults();
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
};

const removeExamResult = async (req, res) => {
  try {
    const result = await deleteExamResult(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }
    res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete result'
    });
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
  removeExamResult
};
