const express = require('express');
const { v4: uuidv4 } = require('uuid');
const EquipmentCategory = require('../models/EquipmentCategory');

const router = express.Router();

// GET all categories or single category by ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (id) {
      const category = await EquipmentCategory.findOne({ id });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.json(category);
    }
    
    const categories = await EquipmentCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    
    const category = new EquipmentCategory(data);
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update category
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const updatedCategory = await EquipmentCategory.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE category by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedCategory = await EquipmentCategory.findOneAndDelete({ id });
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;