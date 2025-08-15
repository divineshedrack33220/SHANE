const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const eventRoutes = require('./routes/Events');
const highlightRoutes = require('./routes/Highlight');
const scheduleRoutes = require('./routes/Schedule');
const winRoutes = require('./routes/Win');
const uploadRoutes = require('./routes/Upload');
const streamStatusRoutes = require('./routes/streamStatus');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/events', eventRoutes);
app.use('/highlights', highlightRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/wins', winRoutes);
app.use('/upload', uploadRoutes);
app.use('/stream-status', streamStatusRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/affiliate', (req, res) => res.sendFile(path.join(__dirname, 'public', 'affiliate.html')));
app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog.html')));
app.get('/community', (req, res) => res.sendFile(path.join(__dirname, 'public', 'community.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/events', (req, res) => res.sendFile(path.join(__dirname, 'public', 'events.html')));
app.get('/hall-of-fame', (req, res) => res.sendFile(path.join(__dirname, 'public', 'hall-of-fame.html')));
app.get('/stream', (req, res) => res.sendFile(path.join(__dirname, 'public', 'stream.html')));

// 404 Handler
app.use((req, res) => {
  console.log(`404: Route ${req.originalUrl} not found`);
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: `Something went wrong: ${err.message}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));