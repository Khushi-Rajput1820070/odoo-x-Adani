const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Notification = require('../models/Notification');

const router = express.Router();

// GET all notifications or single notification by ID
router.get('/', async (req, res) => {
  try {
    const { id, userId } = req.query;
    
    if (id) {
      const notification = await Notification.findOne({ id });
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      return res.json(notification);
    }
    
    let query = {};
    if (userId) query.userId = userId;
    
    const notifications = await Notification.find(query);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new notification
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.createdAt = data.createdAt || new Date().toISOString();
    data.isRead = data.isRead || false;
    
    const notification = new Notification(data);
    await notification.save();
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update notification
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE notification by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedNotification = await Notification.findOneAndDelete({ id });
    
    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;