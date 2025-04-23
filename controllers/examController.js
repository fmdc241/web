const {
  createExam,
  getAllExams,
  getExamById,
  deleteExam,
} = require('../models/examModel');

const createNewExam = async (req, res) => {
  try {
    const { title, description, pdfUrl, pdfName, questionCount, correctAnswers } = req.body;

    // Validate required fields
    if (!title || !description || !pdfUrl || !pdfName || !questionCount || !correctAnswers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Call createExam to insert into the database
    const exam = await createExam(title, description, pdfUrl, pdfName, questionCount, correctAnswers);

    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Error creating exam' });
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await getAllExams(); // Fetch exams from the database
    res.status(200).json({ exams }); // Send the exams as JSON response
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Error fetching exams' });
  }
};

module.exports = {
  createNewExam,
  getExams, // Ensure this is exported
  getExam,
  removeExam,
};
const getExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json({ message: 'Fetched exam successfully', exam });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Error fetching exam' });
  }
};

const removeExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Delete the exam
    await deleteExam(id);

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Error deleting exam' });
  }
};

module.exports = {
  createNewExam,
  getExams,
  getExam,
  removeExam,
};
