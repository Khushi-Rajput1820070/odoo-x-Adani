const express = require('express');
const { v4: uuidv4 } = require('uuid');
const WorkCenter = require('../models/WorkCenter');

const router = express.Router();

// GET all work centers or single work center by ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (id) {
      const workCenter = await WorkCenter.findOne({ id });
      if (!workCenter) {
        return res.status(404).json({ error: 'Work center not found' });
      }
      return res.json(workCenter);
    }
    
    const workCenters = await WorkCenter.find();
    res.json(workCenters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new work center
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const workCenter = new WorkCenter(data);
    await workCenter.save();
    
    res.status(201).json(workCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update work center
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedWorkCenter = await WorkCenter.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedWorkCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    
    res.json(updatedWorkCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE work center by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedWorkCenter = await WorkCenter.findOneAndDelete({ id });
    
    if (!deletedWorkCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;