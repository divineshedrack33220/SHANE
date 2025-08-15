const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true }, // Cloudinary URL
  videoUrl: { type: String, required: true }, // Kick video URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Highlight', highlightSchema);