const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'technician', 'user'], 
    required: true 
  },
  avatar: String,
  department: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  companyId: { type: String, required: true } // ID of the admin who owns this company (for admin, this is their own ID)
}, {
  timestamps: false // We're using custom createdAt field
});

module.exports = mongoose.model('User', userSchema);