const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const router = express.Router();

// GET all users or single user by ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (id) {
      const user = await User.findOne({ id });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }
    
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.createdAt = data.createdAt || new Date().toISOString();
    data.role = data.role || 'user';
    
    const user = new User(data);
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update user
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedUser = await User.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE user by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedUser = await User.findOneAndDelete({ id });
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;