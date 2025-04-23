// routes/index.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.use('/auth', require('./authRoutes'));

// Protected routes
router.use('/users', protect, require('./userRoutes'));
router.use('/exams', protect, require('./examRoutes'));
router.use('/toc', protect, require('./tocRoutes'));
router.use('/youtube', protect, require('./youtubeRoutes'));

// Admin-only routes
// router.use('/admin', protect, admin, require('./adminRoutes'));

module.exports = router;
