const mongoose = require('mongoose');

const streamStatusSchema = new mongoose.Schema({
  liveStatus: { type: Boolean, required: true, default: false },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StreamStatus', streamStatusSchema);