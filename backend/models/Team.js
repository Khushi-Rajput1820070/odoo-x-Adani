const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  memberIds: [{ type: String }], // Array of user IDs
  createdAt: { type: String, default: () => new Date().toISOString() },
  companyId: String
}, {
  timestamps: false
});

module.exports = mongoose.model('Team', teamSchema);