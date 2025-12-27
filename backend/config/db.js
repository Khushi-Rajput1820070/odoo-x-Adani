const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use a more robust connection string
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lovelyblinks2007_db_user:oddo_adani@cluster0.xfpgxlr.mongodb.net/gearguard?retryWrites=true&w=majority', {
      // Additional options to handle connection issues
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Please ensure your IP address is whitelisted in MongoDB Atlas');
    console.error('Or use a local MongoDB instance for development');
    process.exit(1);
  }
};

module.exports = connectDB;