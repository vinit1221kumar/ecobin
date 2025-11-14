import Settings from '../models/Settings.js';

// Calculate credits based on category and weight
export const calculateCredits = async (category, weight, quantity) => {
  // Get settings for reward rate
  const settings = await Settings.getSettings();
  const rewardRatePerKg = settings.rewardRatePerKg || 1;

  // Base credits per category
  const categoryCredits = {
    mobile: 10,
    laptop: 50,
    tv: 30,
    computer: 40,
    mixed: 20,
    other: 15,
  };

  let credits = categoryCredits[category] || 15;

  // Add weight-based credits using reward rate
  if (weight) {
    credits += Math.floor(weight * rewardRatePerKg);
  }

  // Add quantity-based credits (if no weight provided)
  if (!weight && quantity) {
    credits += quantity * 5;
  }

  return credits;
};

