import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Validate MongoDB URI is provided
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

    if (!mongoUri) {
      console.error('❌ ERROR: MongoDB connection string is not set!');
      console.error('Please set MONGODB_URI in your .env file');
      console.error('Example: MONGODB_URI=mongodb://localhost:27017/ecobin');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('MongoNetworkError') || error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Make sure MongoDB is running and the connection string is correct');
    }
    process.exit(1);
  }
};

export default connectDB;

