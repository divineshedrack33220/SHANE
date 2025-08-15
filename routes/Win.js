const express = require('express');
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Win = require('../models/Win');

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
    folder: 'shane_uploads/wins',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const wins = await Win.find().sort({ date: -1 });
    res.json(wins.map(win => ({
      _id: win._id,
      username: win.username,
      winAmount: win.winAmount,
      amount: win.winAmount, // For compatibility with existing frontend
      game: win.game,
      details: win.details,
      date: win.date,
      image: win.image
    })));
  } catch (error) {
    console.error('Error fetching wins:', error);
    res.status(500).json({ error: 'Server error while fetching wins' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { username, amount, game, details, date } = req.body;
    if (!username || !amount || !game || !details || !date) {
      return res.status(400).json({ error: 'Missing required fields: username, amount, game, details, and date are required' });
    }

    const win = new Win({
      username,
      winAmount: parseFloat(amount),
      game,
      details,
      date: new Date(date),
      image: req.file ? req.file.path : 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/shane_uploads/wins/placeholder.jpg' // Replace with your Cloudinary placeholder
    });

    await win.save();
    res.status(201).json({
      _id: win._id,
      username: win.username,
      winAmount: win.winAmount,
      amount: win.winAmount,
      game: win.game,
      details: win.details,
      date: win.date,
      image: win.image
    });
  } catch (error) {
    console.error('Error creating win:', error);
    res.status(500).json({ error: `Failed to create win: ${error.message}` });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, amount, game, details, date } = req.body;
    if (!username || !amount || !game || !details || !date) {
      return res.status(400).json({ error: 'Missing required fields: username, amount, game, details, and date are required' });
    }

    const updateData = {
      username,
      winAmount: parseFloat(amount),
      game,
      details,
      date: new Date(date),
      updatedAt: Date.now()
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const win = await Win.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!win) {
      return res.status(404).json({ error: 'Win not found' });
    }

    res.json({
      _id: win._id,
      username: win.username,
      winAmount: win.winAmount,
      amount: win.winAmount,
      game: win.game,
      details: win.details,
      date: win.date,
      image: win.image
    });
  } catch (error) {
    console.error('Error updating win:', error);
    res.status(500).json({ error: `Failed to update win: ${error.message}` });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const win = await Win.findByIdAndDelete(id);
    if (!win) {
      return res.status(404).json({ error: 'Win not found' });
    }
    if (win.image && !win.image.includes('placeholder.jpg')) {
      const publicId = win.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`shane_Uploads/wins/${publicId}`);
    }
    res.json({ message: 'Win deleted successfully' });
  } catch (error) {
    console.error('Error deleting win:', error);
    res.status(500).json({ error: `Failed to delete win: ${error.message}` });
  }
});

module.exports = router;