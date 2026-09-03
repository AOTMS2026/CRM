const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aotms_secret_salt_2026';

// Helper to generate 7-day JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/sign-up or /api/auth/signup
const handleSignUp = async (req, res) => {
  const { name, email, password, companyName, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const validRole = ['admin', 'manager', 'employee'].includes(role?.toLowerCase()) ? role.toLowerCase() : 'employee';

  const hashedPassword = User.hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    companyName: companyName ? companyName.trim() : '',
    phone: phone ? phone.trim() : '',
    role: validRole,
  });

  const token = generateToken(user);
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    companyName: user.companyName,
    phone: user.phone,
    role: user.role,
  };

  res.status(201).json({
    success: true,
    token,
    user: userObj,
    message: 'User registered successfully!'
  });
};

// POST /api/auth/sign-in or /api/auth/login or /api/auth/signin
const handleSignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Fallback check for initial admin credentials
  if (email === '23hp1a0548@gmail.com' && password === 'Mahesh@2005') {
    let adminUser = await User.findOne({ email: email.toLowerCase() });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Shop Admin',
        email: email.toLowerCase(),
        password: User.hashPassword(password),
        role: 'admin',
      });
    }
    const token = generateToken(adminUser);
    return res.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      }
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.verifyPassword(password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    companyName: user.companyName,
    phone: user.phone,
    role: user.role,
  };

  res.json({
    success: true,
    token,
    user: userObj,
    message: 'Logged in successfully!'
  });
};

// GET /api/auth/me
const handleMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

router.post('/sign-up', handleSignUp);
router.post('/signup', handleSignUp);
router.post('/sign-in', handleSignIn);
router.post('/signin', handleSignIn);
router.post('/login', handleSignIn);
router.get('/me', handleMe);

module.exports = router;