const express = require('express');
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Highlight = require('../models/Highlight');

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shane_uploads',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'], // Added gif
  },
});
const upload = multer({ storage: storage });

// POST /highlights - Create a new highlight with thumbnail upload
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, videoUrl } = req.body;
    if (!title || !description || !videoUrl || !req.file) {
      return res.status(400).json({ error: 'Missing required fields: title, description, videoUrl, and thumbnail are required' });
    }
    const highlight = new Highlight({
      title,
      description,
      thumbnailUrl: req.file.path,
      videoUrl,
      date: new Date()
    });
    await highlight.save();
    res.status(201).json(highlight);
  } catch (err) {
    console.error('Error creating highlight:', err);
    res.status(500).json({ error: `Failed to create highlight: ${err.message}` });
  }
});

// GET /highlights - Retrieve all highlights
router.get('/', async (req, res) => {
  try {
    const highlights = await Highlight.find();
    res.json(highlights);
  } catch (err) {
    console.error('Error fetching highlights:', err);
    res.status(500).json({ error: `Failed to fetch highlights: ${err.message}` });
  }
});

// PUT /highlights/:id - Update a highlight by ID
router.put('/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl } = req.body;
    if (!title || !description || !videoUrl) {
      return res.status(400).json({ error: 'Missing required fields: title, description, and videoUrl are required' });
    }
    const updateData = { title, description, videoUrl, updatedAt: Date.now() };
    if (req.file) {
      updateData.thumbnailUrl = req.file.path;
    }
    const highlight = await Highlight.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!highlight) {
      return res.status(404).json({ error: 'Highlight not found' });
    }
    res.json(highlight);
  } catch (err) {
    console.error('Error updating highlight:', err);
    res.status(500).json({ error: `Failed to update highlight: ${err.message}` });
  }
});

// DELETE /highlights/:id - Delete a highlight by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await Highlight.findByIdAndDelete(id);
    if (!highlight) {
      return res.status(404).json({ error: 'Highlight not found' });
    }
    if (highlight.thumbnailUrl) {
      const publicId = highlight.thumbnailUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`shane_uploads/${publicId}`);
    }
    res.json({ message: 'Highlight deleted successfully' });
  } catch (err) {
    console.error('Error deleting highlight:', err);
    res.status(500).json({ error: `Failed to delete highlight: ${err.message}` });
  }
});

module.exports = router;