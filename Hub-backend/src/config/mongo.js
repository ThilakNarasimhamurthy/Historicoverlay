const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    // const db = mongoose.connection.useDb('Hub');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectMongo };