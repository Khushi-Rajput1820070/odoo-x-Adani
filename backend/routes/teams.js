const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Team = require('../models/Team');

const router = express.Router();

// GET all teams or single team by ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (id) {
      const team = await Team.findOne({ id });
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      return res.json(team);
    }
    
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new team
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const team = new Team(data);
    await team.save();
    
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update team
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedTeam = await Team.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE team by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedTeam = await Team.findOneAndDelete({ id });
    
    if (!deletedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;