import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    rewardRatePerKg: {
      type: Number,
      default: 1, // 1 credit per kg
      min: 0,
    },
    eWasteCategories: {
      type: [String],
      default: ['mobile', 'laptop', 'tv', 'computer', 'mixed', 'other'],
    },
    pickupLimits: {
      maxPickupsPerDay: {
        type: Number,
        default: 10,
      },
      maxPickupsPerCollector: {
        type: Number,
        default: 5,
      },
    },
    regionCoverage: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

