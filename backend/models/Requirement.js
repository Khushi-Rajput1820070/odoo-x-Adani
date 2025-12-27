const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  requestId: { type: String, required: true },
  submittedBy: { type: String, required: true },
  pricing: Number,
  products: [{ type: String }], // Array of product IDs or names
  notes: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: String, default: () => new Date().toISOString() },
  approvedAt: String // ISO string
}, {
  timestamps: false
});

module.exports = mongoose.model('Requirement', requirementSchema);