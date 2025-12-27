const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['Corrective', 'Preventive'], 
    required: true 
  },
  equipmentId: { type: String, required: true },
  requestedByUserId: { type: String, required: true },
  assignedToUserId: String,
  teamId: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['New', 'In Progress', 'Repaired', 'Scrap'], 
    default: 'New' 
  },
  scheduledDate: String, // ISO string date (YYYY-MM-DD)
  completedDate: String, // ISO string
  durationHours: Number,
  notes: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  isOverdue: { type: Boolean, default: false },
  // New fields from wireframe
  cost: Number,
  costPerHour: Number,
  quantity: Number,
  quantityUnit: String,
  dateTarget: String, // ISO string
  alternativeInformation: String,
  frequency: String, // e.g., "Daily", "Weekly", "Monthly"
  location: String,
  time: String, // Time field (HH:mm format)
  attachments: [String], // URLs or file paths
  workCenterId: String, // Reference to work center
  acceptedAt: String // ISO string
}, {
  timestamps: false
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);