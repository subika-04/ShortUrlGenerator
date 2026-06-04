require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const redirectRoute = require('./routes/redirect');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const app = express();



app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'URL Shortener API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);

// Redirect route (must be last)
app.use('/', redirectRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
