import express from 'express';
import Partner from '../models/Partner.js';

const router = express.Router();

// Public route to get all active partners
router.get('/', async (req, res, next) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

