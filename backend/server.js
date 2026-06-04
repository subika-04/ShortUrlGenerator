require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Routes directly inline - no require
app.post('/api/auth/signup', (req, res) => res.json({ success: true }));
app.post('/api/auth/login', (req, res) => res.json({ token: 'test', user: { id: '1', name: 'Test' } }));
app.get('/api/auth/me', (req, res) => res.json({ user: { id: '1', name: 'Test' } }));

app.get('/api/url/user/all', (req, res) => res.json({ urls: [] }));
app.post('/api/url/shorten', (req, res) => res.json({ url: { shortCode: 'test123', originalUrl: 'https://test.com' } }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log('Server running'));
  })
  .catch(e => { console.error(e); process.exit(1); });