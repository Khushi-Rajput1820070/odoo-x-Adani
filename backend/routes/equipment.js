const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Equipment = require('../models/Equipment');
const MaintenanceRequest = require('../models/MaintenanceRequest');

const router = express.Router();

// GET all equipment or single equipment by ID
router.get('/', async (req, res) => {
  try {
    const { id, teamId, status, category } = req.query;
    
    if (id) {
      const equipment = await Equipment.findOne({ id });
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      return res.json(equipment);
    }
    
    let query = {};
    if (teamId) query.maintenanceTeamId = teamId;
    if (status) query.status = status;
    if (category) query.category = category;
    
    const equipment = await Equipment.find(query);
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new equipment
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.status = data.status || 'Active';
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const equipment = new Equipment(data);
    await equipment.save();
    
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update equipment
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    // If equipment is marked as scrapped, update related requests
    if (data.status === 'Scrapped') {
      await MaintenanceRequest.updateMany(
        { equipmentId: data.id, maintenanceFor: 'Equipment' },
        { stage: 'Scrap' }
      );
    }
    
    const updatedEquipment = await Equipment.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(updatedEquipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE equipment by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    // Remove equipment
    const deletedEquipment = await Equipment.findOneAndDelete({ id });
    
    if (!deletedEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Remove related requests
    await MaintenanceRequest.deleteMany({ equipmentId: id });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;