import Settings from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PATCH /api/admin/settings
// @access  Private (Admin)
export const updateSettings = async (req, res, next) => {
  try {
    const {
      rewardRatePerKg,
      eWasteCategories,
      pickupLimits,
      regionCoverage,
    } = req.body;

    let settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      settings = await Settings.create({});
    }

    if (rewardRatePerKg !== undefined) {
      if (rewardRatePerKg < 0) {
        return res.status(400).json({
          success: false,
          message: 'Reward rate must be non-negative',
        });
      }
      settings.rewardRatePerKg = rewardRatePerKg;
    }

    if (eWasteCategories !== undefined) {
      if (!Array.isArray(eWasteCategories)) {
        return res.status(400).json({
          success: false,
          message: 'eWasteCategories must be an array',
        });
      }
      settings.eWasteCategories = eWasteCategories;
    }

    if (pickupLimits !== undefined) {
      settings.pickupLimits = { ...settings.pickupLimits, ...pickupLimits };
    }

    if (regionCoverage !== undefined) {
      if (!Array.isArray(regionCoverage)) {
        return res.status(400).json({
          success: false,
          message: 'regionCoverage must be an array',
        });
      }
      settings.regionCoverage = regionCoverage;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

