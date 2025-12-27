const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const equipmentRoutes = require('./routes/equipment');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const trackingLogRoutes = require('./routes/tracking-logs');
const requirementRoutes = require('./routes/requirements');
const workCenterRoutes = require('./routes/workcenters');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tracking-logs', trackingLogRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/workcenters', workCenterRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'GearGuard Backend API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});