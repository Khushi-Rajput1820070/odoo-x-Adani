const express = require('express');
const { v4: uuidv4 } = require('uuid');
const TrackingLog = require('../models/TrackingLog');

const router = express.Router();

// GET all tracking logs or single log by ID
router.get('/', async (req, res) => {
  try {
    const { id, requestId } = req.query;
    
    if (id) {
      const log = await TrackingLog.findOne({ id });
      if (!log) {
        return res.status(404).json({ error: 'Tracking log not found' });
      }
      return res.json(log);
    }
    
    let query = {};
    if (requestId) query.requestId = requestId;
    
    const logs = await TrackingLog.find(query);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new tracking log
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const log = new TrackingLog(data);
    await log.save();
    
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update tracking log
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedLog = await TrackingLog.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedLog) {
      return res.status(404).json({ error: 'Tracking log not found' });
    }
    
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE tracking log by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedLog = await TrackingLog.findOneAndDelete({ id });
    
    if (!deletedLog) {
      return res.status(404).json({ error: 'Tracking log not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;