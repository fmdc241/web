const { createTocItem, getAllTocItems, deleteTocItem, updateTocCategory, deleteTocCategory } = require('../models/tocModel');

const createItem = async (req, res) => {
  const { category, topic, linkUrl } = req.body;

  try {
    const item = await createTocItem(category, topic, linkUrl);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await getAllTocItems();
    
    // Group by category for frontend
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    await deleteTocItem(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const renameCategory = async (req, res) => {
  const { oldCategory, newCategory } = req.body;

  try {
    await updateTocCategory(oldCategory, newCategory);
    res.json({ message: 'Category renamed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeCategory = async (req, res) => {
  const { category } = req.params;

  try {
    await deleteTocCategory(category);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTOC = async (req, res) => {
  try {
    const { title } = req.body;
    await updateTOCById(req.params.id, title);
    res.json({ message: 'TOC updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTOC = async (req, res) => {
  try {
    await deleteTOCById(req.params.id);
    res.json({ message: 'TOC deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  renameCategory,
  removeCategory,
  updateTOC,
  deleteTOC,
};