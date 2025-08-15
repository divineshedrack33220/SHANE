const mongoose = require('mongoose');

const fameSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  winAmount: {
    type: Number,
    required: [true, 'Win amount is required'],
    min: [0, 'Win amount cannot be negative']
  },
  game: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true,
    maxlength: [100, 'Game name cannot exceed 100 characters']
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true,
    maxlength: [500, 'Details cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  image: {
    type: String,
    default: 'img/placeholder.jpg'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Win', fameSchema);