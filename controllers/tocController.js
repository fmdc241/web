const { createTocItem, getAllTocItems, deleteTocItem, updateTocCategory, deleteTocCategory } = require('../models/tocModel');

const createItem = async (req, res) => {
  try {
    const { category, topic, linkUrl } = req.body;
    if (!category || !topic || !linkUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields: category, topic, linkUrl',
      });
    }

    const item = await createTocItem(category, topic, linkUrl);
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('TOC creation failed:', error);
    res.status(500).json({ success: false, error: 'Failed to create TOC item' });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await getAllTocItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching TOC items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch TOC items' });
  }
};

const deleteItem = async (req, res) => {
  try {
    await deleteTocItem(req.params.id);
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting TOC item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete TOC item' });
  }
};

const renameCategory = async (req, res) => {
  const { oldCategory, newCategory } = req.body;
  if (!oldCategory || !newCategory) {
    return res.status(400).json({
      success: false,
      error: 'Both oldCategory and newCategory are required',
    });
  }

  try {
    await updateTocCategory(oldCategory, newCategory);
    res.json({ success: true, message: 'Category renamed' });
  } catch (error) {
    console.error('Error renaming TOC category:', error);
    res.status(500).json({ success: false, error: 'Failed to rename category' });
  }
};

const removeCategory = async (req, res) => {
  const { category } = req.params;
  if (!category) {
    return res.status(400).json({
      success: false,
      error: 'Category parameter is required',
    });
  }

  try {
    await deleteTocCategory(category);
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting TOC category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
};

const updateTOC = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    await updateTocCategory(req.params.id, title);
    res.json({ success: true, message: 'TOC updated successfully' });
  } catch (error) {
    console.error('Error updating TOC:', error);
    res.status(500).json({ success: false, error: 'Failed to update TOC' });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  renameCategory,
  removeCategory,
  updateTOC,
};
