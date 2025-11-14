import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user(s) - accepts single user or array of users
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    // Check if request body is an array (multiple users) or single object
    const isArray = Array.isArray(req.body);
    const usersData = isArray ? req.body : [req.body];

    const results = [];
    const errors = [];

    // Process each user
    for (let i = 0; i < usersData.length; i++) {
      const { name, email, password, address, phone, secretKey, role } = usersData[i];

      try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
          errors.push({
            index: i,
            email,
            error: 'User already exists with this email',
          });
          continue;
        }

        // Validate admin-specific fields
        if (role === 'admin') {
          if (!phone || !secretKey) {
            errors.push({
              index: i,
              email: email || 'unknown',
              error: 'Phone number and secret key are required for admin registration',
            });
            continue;
          }
        } else {
          // Check if address exists and is not empty
          if (!address || (typeof address === 'string' && address.trim() === '')) {
            errors.push({
              index: i,
              email: email || 'unknown',
              error: 'Address is required for non-admin users',
            });
            continue;
          }
        }

        // Create user
        const userData = {
          name,
          email,
          password,
          role: role || 'resident',
        };

        if (role === 'admin') {
          userData.phone = phone;
          userData.secretKey = secretKey;
        } else {
          userData.address = address;
        }

        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id);

        results.push({
          success: true,
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            phone: user.phone,
          },
        });
      } catch (error) {
        errors.push({
          index: i,
          email: usersData[i].email || 'unknown',
          error: error.message || 'Failed to create user',
        });
      }
    }

    // If single user request, return single response format
    if (!isArray) {
      if (results.length > 0) {
        return res.status(201).json(results[0]);
      } else {
        return res.status(400).json({
          success: false,
          message: errors[0]?.error || 'Failed to register user',
        });
      }
    }

    // For multiple users, return batch results
    // Use 201 if at least one user was created, otherwise 207 (Multi-Status) or 400
    const statusCode = results.length > 0 ? 201 : 400;
    res.status(statusCode).json({
      success: results.length > 0,
      total: usersData.length,
      successful: results.length,
      failed: errors.length,
      results: results.length > 0 ? results : undefined,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 && results.length === 0 
        ? `All ${usersData.length} user(s) failed to register. Check errors for details.`
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login (requires secret key)
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password, secretKey } = req.body;

    // Validate all fields
    if (!email || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and secret key',
      });
    }

    // Check for user (must be admin)
    const user = await User.findOne({ email, role: 'admin' }).select('+password +secretKey');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not an admin account',
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if secret key matches
    const isSecretMatch = await bcrypt.compare(secretKey, user.secretKey);

    if (!isSecretMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid secret key',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

