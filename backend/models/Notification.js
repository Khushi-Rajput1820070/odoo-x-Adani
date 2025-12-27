const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'new_request', 'request_assigned', 'request_updated', 'request_completed',
      'task_reassigned', 'equipment_updated', 'new_user_registered', 
      'system_alert', 'requirement_submitted', 'tracking_updated'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: String,
  relatedType: { 
    type: String, 
    enum: ['request', 'equipment', 'user'] 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false
});

module.exports = mongoose.model('Notification', notificationSchema);