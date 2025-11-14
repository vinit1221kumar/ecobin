import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getMyCredits, redeemCredits } from '../controllers/creditController.js';

const router = express.Router();

router.get('/my', protect, getMyCredits);
router.post('/redeem', protect, authorize('resident', 'collector'), redeemCredits);

export default router;

