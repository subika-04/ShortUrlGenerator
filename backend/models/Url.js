const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      trim: true,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    lastVisited: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    expiresAtTime: {
      type: String,
      default: null,
    },
    suspendFrom: {
      type: Date,
      default: null,
    },
    suspendFromTime: {
      type: String,
      default: null,
    },
    suspendUntil: {
      type: Date,
      default: null,
    },
    suspendUntilTime: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

urlSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ expiresAt: 1 }, { sparse: true });

module.exports = mongoose.model('Url', urlSchema);