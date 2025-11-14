import User from '../models/User.js';
import Pickup from '../models/Pickup.js';
import Partner from '../models/Partner.js';
import CreditTransaction from '../models/CreditTransaction.js';
import { createNotification } from './notificationController.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { isActive, credits } = req.body;
    const updateData = {};

    // First, fetch the user to check their role
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating admin accounts
    if (typeof isActive === 'boolean' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deactivated',
      });
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (typeof credits === 'number') {
      updateData.credits = credits;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pickups
// @route   GET /api/admin/pickups
// @access  Private (Admin)
export const getAllPickups = async (req, res, next) => {
  try {
    const { status, date, area } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      query.preferredDate = new Date(date);
    }

    const pickups = await Pickup.find(query)
      .populate({
        path: 'resident',
        select: 'name email address',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'collector',
        select: 'name email',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pickups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign collector to pickup
// @route   PATCH /api/admin/pickups/:id/assign
// @access  Private (Admin)
export const assignCollector = async (req, res, next) => {
  try {
    const { collectorId } = req.body;

    if (!collectorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide collector ID',
      });
    }

    // Check if pickup exists and if collector has already accepted
    const existingPickup = await Pickup.findById(req.params.id);
    if (!existingPickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    // Prevent reassigning if collector has accepted the pickup
    if (existingPickup.status && ['accepted', 'reached', 'in_progress', 'completed'].includes(existingPickup.status)) {
      return res.status(403).json({
        success: false,
        message: `Cannot reassign collector. Pickup status is '${existingPickup.status}'. Please reset status to 'pending' first.`,
      });
    }

    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== 'collector') {
      return res.status(404).json({
        success: false,
        message: 'Collector not found',
      });
    }

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      {
        collector: collectorId,
        status: 'assigned',
      },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'resident',
        select: 'name email address',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'collector',
        select: 'name email',
        options: { strictPopulate: false }
      });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    // Send notification to collector
    if (pickup.collector) {
      await createNotification(
        pickup.collector._id,
        'pickup_assigned',
        'New Pickup Assigned',
        `You have been assigned a new pickup request for ${pickup.category}`,
        pickup._id
      );
    }

    // Send notification to resident
    if (pickup.resident) {
      const residentId = pickup.resident._id || pickup.resident;
      await createNotification(
        residentId,
        'pickup_status_update',
        'Pickup Assigned',
        `A collector has been assigned to your ${pickup.category} pickup request`,
        pickup._id
      );
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unassign collector from pickup (revert to pending)
// @route   PATCH /api/admin/pickups/:id/unassign
// @access  Private (Admin)
export const unassignCollector = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    // Prevent unassigning if collector has accepted the pickup
    if (pickup.status && ['accepted', 'reached', 'in_progress', 'completed'].includes(pickup.status)) {
      return res.status(403).json({
        success: false,
        message: `Cannot unassign collector. Pickup status is '${pickup.status}'. Please reset status to 'pending' first.`,
      });
    }

    // If already unassigned, just return current state
    if (!pickup.collector) {
      const populated = await Pickup.findById(pickup._id)
        .populate({
          path: 'resident',
          select: 'name email address',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'collector',
          select: 'name email',
          options: { strictPopulate: false }
        });

      return res.status(200).json({
        success: true,
        message: 'Pickup already unassigned',
        data: populated,
      });
    }

    pickup.collector = null;
    // Only revert to pending if not completed/rejected
    if (pickup.status !== 'completed' && pickup.status !== 'rejected') {
      pickup.status = 'pending';
    }
    await pickup.save();

    const populatedPickup = await Pickup.findById(pickup._id)
      .populate({
        path: 'resident',
        select: 'name email address',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'collector',
        select: 'name email',
        options: { strictPopulate: false }
      });

    res.status(200).json({
      success: true,
      message: 'Collector unassigned from pickup successfully',
      data: populatedPickup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    const totalPickups = await Pickup.countDocuments();
    const completedPickups = await Pickup.countDocuments({ status: 'completed' });
    const totalResidents = await User.countDocuments({ role: 'resident', isActive: true });
    const totalCollectors = await User.countDocuments({ role: 'collector', isActive: true });

    const totalWaste = await Pickup.aggregate([
      { $match: { status: 'completed', weight: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$weight' } } },
    ]);

    const creditSummary = await CreditTransaction.aggregate([
      {
        $group: {
          _id: null,
          earned: {
            $sum: {
              $cond: [{ $eq: ['$type', 'earn'] }, '$amount', 0],
            },
          },
          redeemed: {
            $sum: {
              $cond: [{ $eq: ['$type', 'redeem'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const { earned = 0, redeemed = 0 } = creditSummary[0] || {};
    const totalCredits = earned - redeemed;

    const pickupStatusBreakdown = await Pickup.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalPickups,
        completedPickups,
        totalWaste: totalWaste[0]?.total || 0,
        totalCredits,
        activeUsers,
        totalResidents,
        totalCollectors,
        creditSummary: {
          earned,
          redeemed,
          net: totalCredits,
        },
        pickupStatus: pickupStatusBreakdown.reduce((acc, item) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top contributors
// @route   GET /api/admin/top-contributors
// @access  Private (Admin)
export const getTopContributors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get top contributors by credits earned
    const topByCredits = await User.find({ 
      role: { $in: ['resident', 'collector'] },
      isActive: true 
    })
      .select('name email role credits')
      .sort({ credits: -1 })
      .limit(parseInt(limit));

    // Get top contributors by pickups completed
    const topByPickups = await Pickup.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$resident',
          pickupCount: { $sum: 1 },
          totalWeight: { $sum: '$weight' },
        },
      },
      { $sort: { pickupCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          pickupCount: 1,
          totalWeight: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        topByCredits,
        topByPickups,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pickup status (admin can mark as in progress/completed)
// @route   PATCH /api/admin/pickups/:id/status
// @access  Private (Admin)
export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['pending', 'assigned', 'accepted', 'reached', 'completed', 'rejected', 'in_progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Build update object
    const updateData = { status };
    
    // If resetting to pending, also unassign collector and clear proof photo
    if (status === 'pending') {
      updateData.collector = null;
      updateData.proofPhoto = null;
      updateData.notes = '';
    }

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'resident',
        select: 'name email address',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'collector',
        select: 'name email',
        options: { strictPopulate: false }
      });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (admin can add users)
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    const validRoles = ['resident', 'collector', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const userData = {
      name,
      email,
      password,
      role,
    };

    if (role !== 'admin' && address) {
      userData.address = address;
    }

    if (role === 'admin' && phone) {
      userData.phone = phone;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all partners
// @route   GET /api/admin/partners
// @access  Private (Admin)
export const getPartners = async (req, res, next) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create partner
// @route   POST /api/admin/partners
// @access  Private (Admin)
export const createPartner = async (req, res, next) => {
  try {
    const { name, description, creditsRequired } = req.body;

    const partner = await Partner.create({
      name,
      description: description || '',
      creditsRequired: parseInt(creditsRequired),
    });

    res.status(201).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update partner
// @route   PATCH /api/admin/partners/:id
// @access  Private (Admin)
export const updatePartner = async (req, res, next) => {
  try {
    const { name, description, creditsRequired, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (creditsRequired) updateData.creditsRequired = parseInt(creditsRequired);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete partner
// @route   DELETE /api/admin/partners/:id
// @access  Private (Admin)
export const deletePartner = async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule pickup for resident
// @route   POST /api/admin/pickups/schedule
// @access  Private (Admin)
export const schedulePickup = async (req, res, next) => {
  try {
    const { residentId, category, weight, quantity, preferredDate, preferredTime, description, collectorId } = req.body;

    if (!residentId || !category || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide residentId, category, preferredDate, and preferredTime',
      });
    }

    const resident = await User.findById(residentId);
    if (!resident || resident.role !== 'resident') {
      return res.status(404).json({
        success: false,
        message: 'Resident not found',
      });
    }

    const pickupData = {
      resident: residentId,
      category,
      preferredDate: new Date(preferredDate),
      preferredTime,
      description: description || '',
      status: 'pending',
    };

    if (weight) pickupData.weight = parseFloat(weight);
    if (quantity) pickupData.quantity = parseInt(quantity);
    if (collectorId) {
      const collector = await User.findById(collectorId);
      if (!collector || collector.role !== 'collector') {
        return res.status(404).json({
          success: false,
          message: 'Collector not found',
        });
      }
      pickupData.collector = collectorId;
      pickupData.status = 'assigned';
    }

    const pickup = await Pickup.create(pickupData);

    const populatedPickup = await Pickup.findById(pickup._id)
      .populate({
        path: 'resident',
        select: 'name email address',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'collector',
        select: 'name email',
        options: { strictPopulate: false }
      });

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: populatedPickup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage credits (add or deduct) for resident or collector
// @route   POST /api/admin/users/:id/credits
// @access  Private (Admin)
export const assignCredits = async (req, res, next) => {
  try {
    const { credits, description, action } = req.body;

    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid positive number of credits',
      });
    }

    // Validate credits are in multiples of 5
    if (credits % 5 !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Credits must be in multiples of 5',
      });
    }

    // Validate action
    if (action && action !== 'add' && action !== 'deduct') {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "add" or "deduct"',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'resident' && user.role !== 'collector') {
      return res.status(400).json({
        success: false,
        message: 'Credits can only be managed for residents and collectors',
      });
    }

    const isDeduct = action === 'deduct';
    
    // Check if user has enough credits to deduct
    if (isDeduct && (user.credits || 0) < credits) {
      return res.status(400).json({
        success: false,
        message: 'User does not have enough credits to deduct',
      });
    }

    // Update user credits
    if (isDeduct) {
      user.credits = (user.credits || 0) - credits;
    } else {
      user.credits = (user.credits || 0) + credits;
    }
    await user.save();

    // Create credit transaction
    await CreditTransaction.create({
      user: user._id,
      type: isDeduct ? 'redeem' : 'earn',
      amount: credits,
      description: description || `Credits ${isDeduct ? 'deducted' : 'assigned'} by admin${isDeduct ? ' (rule violation)' : ''}`,
    });

    res.status(200).json({
      success: true,
      message: `Credits ${isDeduct ? 'deducted' : 'assigned'} successfully`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
        },
        creditsChanged: isDeduct ? -credits : credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

