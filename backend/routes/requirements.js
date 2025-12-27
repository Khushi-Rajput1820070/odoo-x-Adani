const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Requirement = require('../models/Requirement');

const router = express.Router();

// GET all requirements or single requirement by ID
router.get('/', async (req, res) => {
  try {
    const { id, requestId } = req.query;
    
    if (id) {
      const requirement = await Requirement.findOne({ id });
      if (!requirement) {
        return res.status(404).json({ error: 'Requirement not found' });
      }
      return res.json(requirement);
    }
    
    let query = {};
    if (requestId) query.requestId = requestId;
    
    const requirements = await Requirement.find(query);
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new requirement
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.submittedAt = data.submittedAt || new Date().toISOString();
    data.status = data.status || 'pending';
    
    const requirement = new Requirement(data);
    await requirement.save();
    
    res.status(201).json(requirement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update requirement
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedRequirement = await Requirement.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedRequirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }
    
    res.json(updatedRequirement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE requirement by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedRequirement = await Requirement.findOneAndDelete({ id });
    
    if (!deletedRequirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;