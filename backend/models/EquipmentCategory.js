const mongoose = require('mongoose');

const equipmentCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  responsible: String, // e.g., "Director", "Manager", "Engineer"
  company: String
}, {
  timestamps: false
});

module.exports = mongoose.model('EquipmentCategory', equipmentCategorySchema);