// src/routes/pickupRoutes.js

import express from "express";
import {
  createPickup,
  getMyPickups,
  getAssignedPickups,
  updatePickupStatus,
} from "../controllers/pickupController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * FINAL PATHS (assuming app.use('/api/pickups', router)):
 *
 * POST   /api/pickups          -> createPickup (protected, resident only)
 * GET    /api/pickups/my       -> getMyPickups (protected)
 * GET    /api/pickups/assigned -> getAssignedPickups (protected, collector only)
 * PATCH  /api/pickups/:id/status -> updatePickupStatus (protected, collector only)
 */

router.post("/", protect, authorize("resident"), createPickup);

router.get("/my", protect, getMyPickups);

router.get("/assigned", protect, authorize("collector"), getAssignedPickups);

router.patch("/:id/status", protect, authorize("collector"), updatePickupStatus);

export default router;
