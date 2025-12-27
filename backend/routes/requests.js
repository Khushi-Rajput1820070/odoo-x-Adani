const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

const router = express.Router();

// GET all requests or single request by ID
router.get('/', async (req, res) => {
  try {
    const { id, equipmentId, teamId, stage, type, assignedToUserId } = req.query;
    
    if (id) {
      const request = await MaintenanceRequest.findOne({ id });
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      return res.json(request);
    }
    
    let query = {};
    if (equipmentId) query.equipmentId = equipmentId;
    if (teamId) query.teamId = teamId;
    if (stage) query.stage = stage;
    if (type) query.type = type;
    if (assignedToUserId) query.assignedToUserId = assignedToUserId;
    
    let requests = await MaintenanceRequest.find(query);
    
    // Calculate overdue status
    requests = requests.map(req => {
      const request = req.toObject();
      if (request.scheduledDate && request.stage !== 'Repaired' && request.stage !== 'Scrap') {
        const scheduledDate = new Date(request.scheduledDate);
        const now = new Date();
        request.isOverdue = scheduledDate < now;
      }
      return request;
    });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new request
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.id = data.id || uuidv4();
    data.stage = data.stage || 'New';
    data.createdAt = data.createdAt || new Date().toISOString();
    data.updatedAt = data.updatedAt || new Date().toISOString();
    data.priority = data.priority || 'Medium';
    
    // Auto-fill team based on equipment if not provided
    if (data.maintenanceFor === 'Equipment' && data.equipmentId && !data.teamId) {
      const equipment = await Equipment.findOne({ id: data.equipmentId });
      if (equipment) {
        data.teamId = equipment.maintenanceTeamId;
      }
    }
    
    const request = new MaintenanceRequest(data);
    await request.save();
    
    // Create notification for new request
    if (data.teamId) {
      const team = await Team.findOne({ id: data.teamId });
      if (team && team.memberIds && team.memberIds.length > 0) {
        const notification = new Notification({
          id: uuidv4(),
          userId: team.memberIds[0], // Notify first team member
          type: 'new_request',
          title: 'New Maintenance Request',
          message: `New request: ${data.subject}`,
          relatedId: data.id,
          relatedType: 'request',
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        await notification.save();
      }
    }
    
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update request
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    const oldRequest = await MaintenanceRequest.findOne({ id: data.id });
    
    // Handle scrap logic
    if (data.stage === 'Scrap' && data.maintenanceFor === 'Equipment' && data.equipmentId) {
      await Equipment.findOneAndUpdate(
        { id: data.equipmentId },
        { 
          status: 'Scrapped', 
          scrapDate: new Date().toISOString() 
        }
      );
    }
    
    const updatedRequest = await MaintenanceRequest.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Create notification for status update
    if (oldRequest && oldRequest.stage !== data.stage) {
      const notification = new Notification({
        id: uuidv4(),
        userId: data.assignedToUserId || data.requestedByUserId,
        type: 'request_updated',
        title: 'Request Status Updated',
        message: `Request "${data.subject}" status changed to ${data.stage}`,
        relatedId: data.id,
        relatedType: 'request',
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      await notification.save();
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE request by ID
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter required' });
    }
    
    const deletedRequest = await MaintenanceRequest.findOneAndDelete({ id });
    
    if (!deletedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;