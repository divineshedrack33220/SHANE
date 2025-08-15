const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /events - Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, link } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields: title, description, and date are required' });
    }
    const event = new Event({
      title,
      description,
      date: new Date(date),
      link,
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: `Failed to create event: ${err.message}` });
  }
});

// GET /events - Retrieve all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch events: ${err.message}` });
  }
});

// PUT /events/:id - Update an event by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, link } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields: title, description, and date are required' });
    }
    const event = await Event.findByIdAndUpdate(
      id,
      { title, description, date: new Date(date), link, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: `Failed to update event: ${err.message}` });
  }
});

// DELETE /events/:id - Delete an event by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete event: ${err.message}` });
  }
});

module.exports = router;