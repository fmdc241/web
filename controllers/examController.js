const createNewExam = async (req, res) => {
  try {
    res.status(201).json({ message: 'Exam created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam' });
  }
};

const getExams = async (req, res) => {
  try {
    res.status(200).json({ message: 'Fetched exams successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams' });
  }
};

const getExam = async (req, res) => {
  try {
    res.status(200).json({ message: 'Fetched exam successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam' });
  }
};

const removeExam = async (req, res) => {
  try {
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam' });
  }
};

module.exports = {
  createNewExam,
  getExams,
  getExam,
  removeExam,
};
