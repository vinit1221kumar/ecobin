import CreditTransaction from '../models/CreditTransaction.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';

// @desc    Get my credits
// @route   GET /api/credits/my
// @access  Private
export const getMyCredits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .populate('pickup', 'category preferredDate')
      .populate('partner', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        balance: user.credits || 0,
        transactions: transactions.map(tx => ({
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          date: tx.createdAt,
          pickup: tx.pickup ? {
            category: tx.pickup.category,
            date: tx.pickup.preferredDate,
          } : null,
          partner: tx.partner ? {
            name: tx.partner.name,
          } : null,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem credits for eco-friendly products
// @route   POST /api/credits/redeem
// @access  Private (Resident, Collector)
export const redeemCredits = async (req, res, next) => {
  try {
    const { partnerId, credits } = req.body;

    if (!partnerId || !credits) {
      return res.status(400).json({
        success: false,
        message: 'Please provide partner ID and credits amount',
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner || !partner.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found or inactive',
      });
    }

    if (partner.creditsRequired !== parseInt(credits)) {
      return res.status(400).json({
        success: false,
        message: `This partner requires ${partner.creditsRequired} credits`,
      });
    }

    const user = await User.findById(req.user._id);
    if (user.credits < partner.creditsRequired) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits',
      });
    }

    // Deduct credits
    user.credits -= partner.creditsRequired;
    await user.save();

    // Create transaction
    await CreditTransaction.create({
      user: req.user._id,
      type: 'redeem',
      amount: partner.creditsRequired,
      description: `Redeemed at ${partner.name}`,
      partner: partnerId,
    });

    res.status(200).json({
      success: true,
      message: 'Credits redeemed successfully',
      data: {
        remainingCredits: user.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

