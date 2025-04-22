const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createResource,
  getResources,
  deleteResource,
} = require('../controllers/youtubeController');

router.route('/')
  .post(protect, admin, createResource)
  .get(getResources);

router.route('/:id')
  .delete(protect, admin, deleteResource);

module.exports = router;