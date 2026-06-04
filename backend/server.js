require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/debug', (req, res) => {
  res.json({ message: 'works' });
});

// Load auth routes with detailed error
let authRoutes;
try {
  authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes OK');
} catch (err) {
  console.log('Auth routes ERROR:', err.message);
}

// Load url routes with detailed error
let urlRoutes;
try {
  urlRoutes = require('./routes/url');
  app.use('/url', urlRoutes);
  console.log('URL routes OK');
} catch (err) {
  console.log('URL routes ERROR:', err.message);
}

// Load redirect routes
let redirectRoute;
try {
  redirectRoute = require('./routes/redirect');
  app.use('/', redirectRoute);
  console.log('Redirect routes OK');
} catch (err) {
  console.log('Redirect routes ERROR:', err.message);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ message: 'Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });