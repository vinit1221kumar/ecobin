import Partner from '../models/Partner.js';

export const seedPartners = async () => {
  try {
    // Define default partners and products
    const defaultPartners = [
      {
        name: 'EcoStore - Reusable Water Bottle',
        description: 'Redeem for a premium stainless steel reusable water bottle. Help reduce plastic waste!',
        creditsRequired: 50,
        isActive: true,
      },
      {
        name: 'GreenLife - Bamboo Cutlery Set',
        description: 'Get an eco-friendly bamboo cutlery set with carrying case. Perfect for sustainable living!',
        creditsRequired: 75,
        isActive: true,
      },
      {
        name: 'EcoBag - Organic Cotton Tote Bag',
        description: 'Stylish and sustainable organic cotton tote bag. Perfect for shopping and daily use!',
        creditsRequired: 60,
        isActive: true,
      },
      // Additional products from EcoStore partner
      {
        name: 'EcoStore - Stainless Steel Straw Set',
        description: 'Premium reusable stainless steel straws with cleaning brush. Say goodbye to plastic straws!',
        creditsRequired: 40,
        isActive: true,
      },
      {
        name: 'EcoStore - Glass Food Storage Containers',
        description: 'Set of 4 eco-friendly glass food storage containers with bamboo lids. Perfect for meal prep!',
        creditsRequired: 80,
        isActive: true,
      },
      // Additional products from GreenLife partner
      {
        name: 'GreenLife - Bamboo Toothbrush Set',
        description: 'Pack of 4 biodegradable bamboo toothbrushes with soft bristles. Sustainable oral care!',
        creditsRequired: 45,
        isActive: true,
      },
      {
        name: 'GreenLife - Organic Cotton Reusable Bags',
        description: 'Set of 5 organic cotton reusable shopping bags. Durable and washable for everyday use!',
        creditsRequired: 55,
        isActive: true,
      },
    ];

    // Check which partners already exist by name
    const existingPartnerNames = await Partner.find({}, 'name').lean();
    const existingNames = existingPartnerNames.map(p => p.name);
    
    // Filter out partners that already exist
    const partnersToAdd = defaultPartners.filter(
      partner => !existingNames.includes(partner.name)
    );
    
    if (partnersToAdd.length > 0) {
      await Partner.insertMany(partnersToAdd);
      console.log(`✅ Seeded ${partnersToAdd.length} new eco-friendly partner(s) successfully`);
    } else {
      console.log('ℹ️  All default partners already exist, skipping seed');
    }
    
    // Ensure at least 7 active products/partners exist (3 original + 4 new products)
    const activePartnersCount = await Partner.countDocuments({ isActive: true });
    if (activePartnersCount < 7) {
      console.log(`⚠️  Warning: Only ${activePartnersCount} active product(s) found. Expected at least 7 products.`);
    } else {
      console.log(`✅ Total of ${activePartnersCount} eco-friendly products available for redemption`);
    }
  } catch (error) {
    console.error('❌ Error seeding partners:', error);
  }
};
