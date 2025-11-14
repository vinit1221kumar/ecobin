import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a partner name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    creditsRequired: {
      type: Number,
      required: [true, 'Please provide credits required'],
      min: 1,
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

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;

