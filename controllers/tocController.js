const updateTOCById = async (id, title) => {
  // Example function for updating a TOC
  return db.query('UPDATE toc SET title = $1 WHERE id = $2', [title, id]);
};

const updateTOC = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    await updateTOCById(req.params.id, title);
    res.json({ message: 'TOC updated successfully' });
  } catch (error) {
    console.error('Error updating TOC:', error);
    res.status(500).json({ message: 'Failed to update TOC' });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  renameCategory,
  removeCategory,
  updateTOC, // Ensure updateTOC is exported
};
