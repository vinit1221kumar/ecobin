import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getUsers,
  updateUser,
  getAllPickups,
  assignCollector,
  unassignCollector,
  getStats,
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  schedulePickup,
  assignCredits,
  getTopContributors,
  updatePickupStatus,
  createUser,
  deleteUser,
} from '../controllers/adminController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/credits', assignCredits);

// Pickup management
router.get('/pickups', getAllPickups);
router.post('/pickups/schedule', schedulePickup);
router.patch('/pickups/:id/assign', assignCollector);
router.patch('/pickups/:id/unassign', unassignCollector);
router.patch('/pickups/:id/status', updatePickupStatus);

// Statistics
router.get('/stats', getStats);
router.get('/top-contributors', getTopContributors);

// Partner management
router.get('/partners', getPartners);
router.post('/partners', createPartner);
router.patch('/partners/:id', updatePartner);
router.delete('/partners/:id', deletePartner);

// Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;

