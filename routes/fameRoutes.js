const express = require('express');
const router = express.Router();
const Win = require('./fame');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/wins');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg and .png files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all wins
router.get('/', async (req, res) => {
  try {
    const wins = await Win.find().sort({ date: -1 });
    res.json(wins.map(win => ({
      _id: win._id,
      username: win.username,
      winAmount: win.winAmount,
      amount: win.winAmount, // For admin panel compatibility
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

// Create a new win
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { username, amount, game, details, date } = req.body;
    if (!username || !amount || !game || !details || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const win = new Win({
      username,
      winAmount: amount,
      game,
      details,
      date,
      image: req.file ? `/img/wins/${req.file.filename}` : 'img/placeholder.jpg'
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
    res.status(500).json({ error: 'Server error while creating win' });
  }
});

// Update a win
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { username, amount, game, details, date } = req.body;
    if (!username || !amount || !game || !details || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updateData = {
      username,
      winAmount: amount,
      game,
      details,
      date
    };

    if (req.file) {
      updateData.image = `/img/wins/${req.file.filename}`;
    }

    const win = await Win.findByIdAndUpdate(req.params.id, updateData, {
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
    res.status(500).json({ error: 'Server error while updating win' });
  }
});

// Delete a win
router.delete('/:id', async (req, res) => {
  try {
    const win = await Win.findByIdAndDelete(req.params.id);
    if (!win) {
      return res.status(404).json({ error: 'Win not found' });
    }
    res.json({ message: 'Win deleted successfully' });
  } catch (error) {
    console.error('Error deleting win:', error);
    res.status(500).json({ error: 'Server error while deleting win' });
  }
});

module.exports = router;