import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ name, email, password, phone });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get User Profile (authenticated + ownership check)
router.get('/profile/:id', authenticate, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot view other users\' profiles' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update User Profile (authenticated + ownership check)
router.put('/profile/:id', authenticate, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot update other users\' profiles' });
    }

    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to Cart (authenticated - uses req.userId)
router.post('/cart/add', authenticate, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    let userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await User.findByIdAndUpdate(req.userId, { cartData });
    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from Cart (authenticated - uses req.userId)
router.post('/cart/remove', authenticate, async (req, res) => {
  try {
    const { itemId } = req.body;
    let userData = await User.findById(req.userId);
    
    let cartData = userData.cartData || {};
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId];
    }

    await User.findByIdAndUpdate(req.userId, { cartData });
    res.status(200).json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Cart (authenticated + ownership check)
router.get('/cart/:userId', authenticate, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot view other users\' carts' });
    }

    let userData = await User.findById(req.params.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
