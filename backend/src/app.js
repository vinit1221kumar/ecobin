import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import minioTestRoute from "./routes/minioTestRoute.js";
import adminDeployRoute from './routes/adminDeploy.js';

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
// test route for minio
app.use("/api/minio", minioTestRoute);
// deploy route
app.use('/api/admin', adminDeployRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EcoBin API is running',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;

