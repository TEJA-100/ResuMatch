const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set connection timeout to 3 seconds so fallback activates quickly
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resumatch', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.log(`\n=============================================================`);
    console.log(`WARNING: Could not connect to MongoDB: ${error.message}`);
    console.log(`Activating In-Memory / JSON File Database Fallback...`);
    console.log(`All data will be saved to: backend/data/db.json`);
    console.log(`=============================================================\n`);
    global.useMockDb = true;
  }
};

module.exports = connectDB;
