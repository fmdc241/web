const { createYoutubeResource, getAllYoutubeResources, deleteYoutubeResource } = require('../models/youtubeModel');

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const createResource = async (req, res) => {
  try {
    const required = ['title', 'url'];
    const missing = required.filter(field => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missing.join(', ')}`
      });
    }

    const videoId = extractVideoId(req.body.url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL'
      });
    }

    const resource = await createYoutubeResource({
      title: req.body.title,
      url: req.body.url,
      videoId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      resource
    });

  } catch (error) {
    console.error('YouTube resource creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create resource'
    });
  }
};

const createYoutubeResource = async (req, res) => {
  try {
    const { title, url, videoId } = req.body;

    // Validate required fields
    if (!title || !url || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, url, videoId'
      });
    }

    // Create resource
    const resource = await createYoutubeResource(title, url, videoId);
    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('YouTube resource creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create YouTube resource'
    });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await getAllYoutubeResources();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteResource = async (req, res) => {
  try {
    await deleteYoutubeResource(req.params.id);
    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createResource,
  getResources,
  deleteResource,
};
