const express = require('express');
const router  = express.Router();
const Lead    = require('../models/Lead');

// Helper to clean 10-digit Indian phone number
const cleanPhone = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }
  return digits;
};

// GET /api/leads - Fetch all leads
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') },
    ];
  }

  const leads = await Lead.find(filter).sort('-createdAt');
  res.json({ success: true, leads, count: leads.length });
});

// POST /api/leads - Create a new lead
router.post('/', async (req, res) => {
  const { name, phone, email, address, status, read_rate, notes, source } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }

  const formattedPhone = cleanPhone(phone);
  if (formattedPhone.length !== 10 || !['6','7','8','9'].includes(formattedPhone[0])) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  // Check duplicate phone
  const existing = await Lead.findOne({ phone: formattedPhone });
  if (existing) {
    return res.status(400).json({ success: false, message: 'A lead with this phone number already exists.' });
  }

  const lead = await Lead.create({
    name: name.trim(),
    phone: formattedPhone,
    email: email ? email.toLowerCase().trim() : '',
    address: address ? address.trim() : '',
    status: status || 'Inquiries',
    read_rate: read_rate || '95%',
    notes: notes || '',
    source: source || 'crm',
  });

  res.status(201).json({ success: true, lead, message: 'Lead added successfully!' });
});

// PUT /api/leads/:id - Update lead details or stage
router.put('/:id', async (req, res) => {
  const { name, phone, email, address, status, read_rate, notes } = req.body;
  const updateData = {};

  if (name) updateData.name = name.trim();
  if (phone) {
    const formattedPhone = cleanPhone(phone);
    if (formattedPhone.length === 10 && ['6','7','8','9'].includes(formattedPhone[0])) {
      updateData.phone = formattedPhone;
    }
  }
  if (email !== undefined) updateData.email = email.toLowerCase().trim();
  if (address !== undefined) updateData.address = address.trim();
  if (status) updateData.status = status;
  if (read_rate !== undefined) updateData.read_rate = read_rate;
  if (notes !== undefined) updateData.notes = notes;

  const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

  res.json({ success: true, lead, message: 'Lead updated successfully!' });
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
  res.json({ success: true, message: 'Lead deleted successfully!' });
});

// POST /api/leads/deduplicate - Remove duplicate leads by phone
router.post('/deduplicate', async (req, res) => {
  const allLeads = await Lead.find().sort('createdAt');
  const seenPhones = new Set();
  const duplicateIds = [];

  for (const l of allLeads) {
    if (seenPhones.has(l.phone)) {
      duplicateIds.push(l._id);
    } else {
      seenPhones.add(l.phone);
    }
  }

  if (duplicateIds.length > 0) {
    await Lead.deleteMany({ _id: { $in: duplicateIds } });
  }

  res.json({
    success: true,
    removedCount: duplicateIds.length,
    message: `Deduplicated pipeline! Removed ${duplicateIds.length} duplicate leads.`
  });
});

module.exports = router;
