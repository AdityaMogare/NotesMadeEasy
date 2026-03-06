import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { getSessions } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create simple session
    const sessions = getSessions();
    const sessionId = Math.random().toString(36).substring(2);
    sessions.set(sessionId, { userId: user._id, email: user.email });

    // Return user data (without password) and session
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      sessionId,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create simple session
    const sessions = getSessions();
    const sessionId = Math.random().toString(36).substring(2);
    sessions.set(sessionId, { userId: user._id, email: user.email });

    // Return user data (without password) and session
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      sessionId,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    const sessions = getSessions();
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const session = sessions.get(sessionId);
    res.json({ userId: session.userId, email: session.email });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    const sessions = getSessions();
    sessions.delete(sessionId);
  }
  res.json({ message: 'Logged out successfully' });
});

export default router; 