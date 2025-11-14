import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['mobile', 'laptop', 'tv', 'computer', 'mixed', 'other'],
    },
    weight: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    preferredDate: {
      type: Date,
      required: [true, 'Please provide a preferred date'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Please provide a preferred time'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'accepted', 'reached', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    proofPhoto: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    creditsEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;

