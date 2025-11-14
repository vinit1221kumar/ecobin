import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    address: {
      type: String,
      required: function() {
        return this.role !== 'admin';
      },
    },
    phone: {
      type: String,
      required: function() {
        return this.role === 'admin';
      },
    },
    secretKey: {
      type: String,
      required: function() {
        return this.role === 'admin';
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['resident', 'collector', 'admin'],
      default: 'resident',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    credits: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password and secretKey before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('secretKey') && this.secretKey) {
    this.secretKey = await bcrypt.hash(this.secretKey, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

