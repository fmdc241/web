const { createYoutubeResource, getAllYoutubeResources, deleteYoutubeResource } = require('../models/youtubeModel');

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const createResource = async (req, res) => {
  const { title, url } = req.body;
  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  try {
    const resource = await createYoutubeResource(title, url, videoId);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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