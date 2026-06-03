const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
  userAgent: {
    type: String,
    default: null,
  },
  deviceType: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  operatingSystem: {
    type: String,
    default: 'Unknown',
  },
  ip: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  countryCode: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: 'N/A',
  },
  region: {
    type: String,
    default: 'Unknown',
  },
  fingerprint: {  // ✅ Add this
    type: String,
    default: null,
  },
  isUnique: {  // ✅ Add this
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Visit', VisitSchema);