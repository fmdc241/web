const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createItem,
  getItems,
  deleteItem,
  renameCategory,
  removeCategory,
  updateTOC,
} = require('../controllers/tocController');

router.route('/')
  .post(protect, admin, createItem)
  .get(getItems);

router.route('/:id')
  .delete(protect, admin, deleteItem)
  .put(protect, admin, updateTOC);

router.route('/category/rename')
  .put(protect, admin, renameCategory);

router.route('/category/:category')
  .delete(protect, admin, removeCategory);

module.exports = router;
