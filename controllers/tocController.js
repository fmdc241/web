const {
  createTocItem,
  getAllTocItems,
  deleteTocItem,
  updateTocCategory,
  deleteTocCategory,
  updateTOCById,
  deleteTOCById,
} = require("../models/tocModel");

const createItem = async (req, res) => {
  try {
    const { category, topic, linkUrl } = req.body;
    if (!category || !topic || !linkUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing fields: category, topic, linkUrl",
      });
    }

    const item = await createTocItem(category, topic, linkUrl);
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error("TOC creation failed:", error);
    res.status(500).json({ success: false, error: "Failed to create TOC item" });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await getAllTocItems();
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error("TOC retrieval failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    await deleteTocItem(req.params.id);
    res.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("TOC deletion failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
};
