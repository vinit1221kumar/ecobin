// CHANGED: Load environment variables BEFORE anything else
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { initMinIO } from './config/minio.js';
import { seedPartners } from './utils/seedPartners.js';


// Validate required environment variables
const validateEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\n💡 Please create a .env file with these variables.');
    console.error('   See .env.example for reference.');
    process.exit(1);
  }

  // Warn about optional but recommended variables
  if (!process.env.JWT_EXPIRE) {
    console.warn('⚠️  JWT_EXPIRE not set, using default: 7d');
  }

  console.log('✅ Environment variables validated');
};

// CHANGED: Use env PORT with fallback
const PORT = process.env.PORT || 3000;

// CHANGED: Keep server reference so we can close it on fatal errors
let server;

// CHANGED: Wrap startup in async function and await all initializers
async function startServer() {
  try {
    // Validate environment variables first
    validateEnvVars();

    // Connect to MongoDB (must use a valid MONGO_URI in .env)
    await connectDB();

    // Proceed without Redis (cache disabled)

    // Initialize MinIO bucket
    await initMinIO();

    // Seed default eco-friendly partners
    await seedPartners();

    // Start HTTP server only after all services are ready
    server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error(err);
    process.exit(1);
  }
}

// CHANGED: Actually start the server
startServer();

// CHANGED: Handle unhandled promise rejections robustly
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// CHANGED: Also handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
