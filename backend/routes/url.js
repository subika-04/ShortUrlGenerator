const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  getAnalytics,
  getPublicStats,
  updateExpiry,
  bulkShorten
} = require('../controllers/urlController');

// Debug - log all requests
router.use((req, res, next) => {
  console.log('📢 URL Route hit:', req.method, req.originalUrl);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', req.body);
  }
  next();
});

// Protected routes
router.post('/shorten', protect, shortenUrl);
router.get('/user/all', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);
router.put('/:id', protect, updateUrl);
router.get('/analytics/:id', protect, getAnalytics);
router.patch('/expiry/:id', protect, updateExpiry);
router.post('/bulk', protect, bulkShorten);

// Public route
router.get('/public/:shortCode', getPublicStats);

module.exports = router;