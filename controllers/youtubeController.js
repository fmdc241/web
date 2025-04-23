const {
  createYoutubeResource,
  getAllYoutubeResources,
  deleteYoutubeResource,
} = require("../models/youtubeModel");

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const createResource = async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: "Missing fields: title, url",
      });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, error: "Invalid YouTube URL" });
    }

    const resource = await createYoutubeResource(title, url, videoId);
    res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error("YouTube resource creation failed:", error);
    res.status(500).json({ success: false, error: "Failed to create resource" });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await getAllYoutubeResources();
    res.json(resources);
  } catch (error) {
    console.error("YouTube resources retrieval failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const deleteResource = async (req, res) => {
  try {
    await deleteYoutubeResource(req.params.id);
    res.json({ success: true, message: "Resource removed" });
  } catch (error) {
    console.error("YouTube resource deletion failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  createResource,
  getResources,
  deleteResource,
};
