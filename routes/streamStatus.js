// routes/StreamStatus.js
const express = require('express');
const router = express.Router();
const StreamStatus = require('../models/streamStatus');

// GET stream status
router.get('/', async (req, res) => {
  try {
    let status = await StreamStatus.findOne();
    if (!status) {
      status = new StreamStatus({ liveStatus: false });
      await status.save();
    }
    console.log('GET /stream-status:', status);
    res.json({ liveStatus: status.liveStatus });
  } catch (err) {
    console.error('Error fetching stream status:', err);
    res.status(500).json({ error: 'Failed to fetch stream status', details: err.message });
  }
});

// POST stream status (to match admin.html)
router.post('/', async (req, res) => {
  try {
    const { liveStatus } = req.body;
    if (typeof liveStatus !== 'boolean') {
      return res.status(400).json({ error: 'liveStatus must be a boolean' });
    }
    let status = await StreamStatus.findOne();
    if (!status) {
      status = new StreamStatus({ liveStatus });
    } else {
      status.liveStatus = liveStatus;
      status.updatedAt = new Date();
    }
    await status.save();
    console.log('POST /stream-status:', status);
    res.json({ liveStatus: status.liveStatus });
  } catch (err) {
    console.error('Error updating stream status:', err);
    res.status(500).json({ error: 'Failed to update stream status', details: err.message });
  }
});

module.exports = router;