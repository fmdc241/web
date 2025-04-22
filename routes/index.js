const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/exams', require('./examRoutes'));
router.use('/toc', require('./tocRoutes'));
router.use('/youtube', require('./youtubeRoutes'));

module.exports = router;