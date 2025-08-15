const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Create a new schedule
router.post('/', async (req, res) => {
  try {
    const { day, date, time, description } = req.body;
    if (!day || !date || !time || !description) {
      return res.status(400).json({ error: 'Missing required fields', details: { day: !!day, date: !!date, time: !!time, description: !!description } });
    }
    const schedule = new Schedule({ day, date, time, description });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update a schedule
router.put('/:id', async (req, res) => {
  try {
    const { day, date, time, description } = req.body;
    if (!day || !date || !time || !description) {
      return res.status(400).json({ error: 'Missing required fields', details: { day: !!day, date: !!date, time: !!time, description: !!description } });
    }
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { day, date, time, description },
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;