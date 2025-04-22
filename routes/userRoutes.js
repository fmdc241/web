const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getUsers, deleteUserById } = require('../controllers/userController');

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUserById);

module.exports = router;