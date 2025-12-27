const mongoose = require('mongoose');

const workCenterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cost: Number,
  quantity: Number,
  allocatedManHours: Number,
  costPerHour: Number,
  estimateTotalPrice: Number,
  costTarget: Number,
  description: String,
  skills: [{ 
    id: String,
    workCenterId: String,
    name: String,
    description: String,
    cost: Number,
    costPerHour: Number
  }], // Skills/tasks/methods/processes for this work center
  createdAt: { type: String, default: () => new Date().toISOString() },
  companyId: String
}, {
  timestamps: false
});

module.exports = mongoose.model('WorkCenter', workCenterSchema);