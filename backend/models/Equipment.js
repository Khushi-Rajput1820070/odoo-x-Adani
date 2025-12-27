const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  serialNumber: { type: String, required: true },
  category: { type: String, required: true },
  departmentId: { type: String, required: true },
  assignedToUserId: String,
  purchaseDate: { type: String, required: true }, // ISO string
  warrantyExpiry: String, // ISO string
  location: { type: String, required: true },
  maintenanceTeamId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Scrapped'], 
    default: 'Active' 
  },
  notes: String,
  // New fields from wireframe
  company: String,
  usedFor: String,
  maintenanceType: String, // e.g., "External Maintenance"
  assigneeDate: String, // ISO string
  employee: String,
  stayDate: String, // ISO string
  workOrderId: String
}, {
  timestamps: false
});

module.exports = mongoose.model('Equipment', equipmentSchema);