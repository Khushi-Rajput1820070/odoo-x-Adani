const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  requestId: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false
});

module.exports = mongoose.model('TrackingLog', trackingLogSchema);