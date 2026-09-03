const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, users, count: users.length });
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  const { name, email, password, companyName, phone, role, designation, department } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists.' });
  }

  const hashedPassword = User.hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    companyName: companyName ? companyName.trim() : 'AOTMS Enterprise',
    phone: phone ? phone.trim() : '',
    role: role || 'employee',
    designation: designation ? designation.trim() : 'Operations Specialist',
    department: department ? department.trim() : 'General Operations',
  });

  const userObj = {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    companyName: user.companyName,
    phone: user.phone,
    role: user.role,
    designation: user.designation,
    department: user.department,
    createdAt: user.createdAt,
  };

  res.status(201).json({ success: true, user: userObj, message: 'Employee created successfully!' });
});

// PUT /api/users/:id - Update user details
router.put('/:id', async (req, res) => {
  const { name, email, companyName, phone, role, designation, department } = req.body;
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.toLowerCase().trim();
  if (companyName !== undefined) updateData.companyName = companyName.trim();
  if (phone !== undefined) updateData.phone = phone.trim();
  if (role) updateData.role = role;
  if (designation !== undefined) updateData.designation = designation.trim();
  if (department !== undefined) updateData.department = department.trim();

  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user, message: 'Employee updated successfully' });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = router;
