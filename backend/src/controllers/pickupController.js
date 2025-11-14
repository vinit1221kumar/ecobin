// backend/src/controllers/pickupController.js
import { handleUpload } from "../utils/formidableHelper.js";
import Pickup from "../models/Pickup.js";
import { createNotification } from "./notificationController.js";

export async function createPickup(req, res, next) {
  try {
    const { fields, uploadedFiles } = await handleUpload(req);

    // Formidable returns fields as arrays, so we need to extract the first value
    const getField = (key) => {
      const value = fields[key];
      return Array.isArray(value) ? value[0] : value;
    };

    // Extract form fields
    const category = getField("category");
    const weight = getField("weight") ? parseFloat(getField("weight")) : null;
    const quantity = getField("quantity") ? parseInt(getField("quantity")) : null;
    const preferredDate = getField("preferredDate");
    const preferredTime = getField("preferredTime");
    const description = getField("description") || "";

    // Get photo URL (first uploaded file, if any)
    const photo = uploadedFiles.length > 0 ? uploadedFiles[0] : null;

    // Create pickup in MongoDB
    const pickup = await Pickup.create({
      resident: req.user._id, // From auth middleware
      category,
      weight,
      quantity,
      photo,
      preferredDate: new Date(preferredDate),
      preferredTime,
      description,
      status: "pending", // Default status
    });

    res.status(201).json({
      success: true,
      message: "Pickup request created successfully",
      data: pickup,
    });
  } catch (err) {
    console.error("Pickup upload error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to process pickup request",
      message: err.message 
    });
  }
};

export const getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ resident: req.user._id })
      .populate({
        path: "resident",
        select: "name email",
        options: { strictPopulate: false }
      })
      .populate({
        path: "collector",
        select: "name email",
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 }); // Latest first

    return res.json({
      success: true,
      message: "Pickups fetched successfully",
      data: pickups,
    });
  } catch (error) {
    console.error("getMyPickups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my pickups",
      error: error.message,
    });
  }
};

export const getAssignedPickups = async (req, res) => {
  try {
    // Get pickups assigned to the current collector
    const pickups = await Pickup.find({ collector: req.user._id })
      .populate({
        path: "resident",
        select: "name email address",
        options: { strictPopulate: false }
      })
      .populate({
        path: "collector",
        select: "name email",
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 }); // Latest first

    return res.json({
      success: true,
      message: "Assigned pickups fetched successfully",
      data: pickups,
    });
  } catch (error) {
    console.error("getAssignedPickups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned pickups",
      error: error.message,
    });
  }
};

export const updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to handle as multipart form (with file upload)
    let status, notes, proofPhoto;
    
    try {
      const { fields, uploadedFiles } = await handleUpload(req);
      const getField = (key) => {
        const value = fields[key];
        return Array.isArray(value) ? value[0] : value;
      };
      
      status = getField("status");
      notes = getField("notes") || "";
      proofPhoto = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
    } catch (uploadError) {
      // If handleUpload fails (not multipart), get from body
      status = req.body.status;
      notes = req.body.notes || "";
      proofPhoto = null;
    }

    // Find the pickup and verify it's assigned to this collector
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    // Verify the pickup is assigned to the current collector
    if (pickup.collector?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this pickup",
      });
    }

    // Validate status
    const validStatuses = ['pending', 'assigned', 'accepted', 'reached', 'completed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (proofPhoto) updateData.proofPhoto = proofPhoto;

    // Update pickup
    const updatedPickup = await Pickup.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: "resident",
        select: "name email address",
        options: { strictPopulate: false }
      })
      .populate({
        path: "collector",
        select: "name email",
        options: { strictPopulate: false }
      });

    // Send notification to resident when status changes
    if (status && updatedPickup.resident) {
      const residentId = updatedPickup.resident._id || updatedPickup.resident;
      let title = 'Pickup Status Updated';
      let message = `Your ${updatedPickup.category} pickup status has been updated to ${status}`;
      
      if (status === 'completed') {
        title = 'Pickup Completed!';
        message = `Your ${updatedPickup.category} pickup has been completed! Credits have been awarded.`;
      } else if (status === 'in_progress') {
        title = 'Pickup In Progress';
        message = `Your ${updatedPickup.category} pickup is now in progress.`;
      }

      await createNotification(
        residentId,
        'pickup_status_update',
        title,
        message,
        updatedPickup._id
      );
    }

    return res.json({
      success: true,
      message: "Pickup status updated successfully",
      data: updatedPickup,
    });
  } catch (error) {
    console.error("updatePickupStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update pickup status",
      error: error.message,
    });
  }
};
