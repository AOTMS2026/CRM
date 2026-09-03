const express = require('express');
const router  = express.Router();
const PaySip  = require('../models/PaySip');

// GET /api/paysip - Fetch all Pay_SIP entries
router.get('/', async (req, res) => {
  const paysips = await PaySip.find().sort('-createdAt');
  res.json({ success: true, paysips, count: paysips.length });
});

// POST /api/paysip - Create new Pay_SIP entry
router.post('/', async (req, res) => {
  const { clientName, phone, folioNumber, sipAmount, monthlyDay, installmentCount, fundName, paymentStatus } = req.body;
  if (!clientName || !phone || !folioNumber || !sipAmount) {
    return res.status(400).json({ success: false, message: 'Client Name, Phone, Folio Number, and SIP Amount are required.' });
  }

  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);

  const cleanFolio = String(folioNumber).trim();

  // Check duplicate folio number
  const existing = await PaySip.findOne({ folioNumber: cleanFolio });
  if (existing) {
    return res.status(400).json({ success: false, message: `Pay_SIP with Folio Number '${cleanFolio}' already exists in database.` });
  }

  const paysip = await PaySip.create({
    clientName: clientName.trim(),
    phone: cleanPhone,
    folioNumber: cleanFolio,
    sipAmount: Number(sipAmount),
    monthlyDay: monthlyDay ? Number(monthlyDay) : 10,
    installmentCount: installmentCount ? Number(installmentCount) : 12,
    fundName: fundName ? fundName.trim() : 'HDFC Flexi Cap Fund',
    paymentStatus: paymentStatus || 'Active'
  });

  res.status(201).json({ success: true, paysip, message: 'Pay_SIP generated and saved in MongoDB!' });
});

// PUT /api/paysip/:id - Update Pay_SIP entry
router.put('/:id', async (req, res) => {
  const { clientName, phone, folioNumber, sipAmount, monthlyDay, installmentCount, fundName, paymentStatus } = req.body;
  const updateData = {};
  if (clientName !== undefined) updateData.clientName = clientName.trim();
  if (phone !== undefined) {
    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);
    updateData.phone = cleanPhone;
  }
  if (folioNumber !== undefined) updateData.folioNumber = String(folioNumber).trim();
  if (sipAmount !== undefined) updateData.sipAmount = Number(sipAmount);
  if (monthlyDay !== undefined) updateData.monthlyDay = Number(monthlyDay);
  if (installmentCount !== undefined) updateData.installmentCount = Number(installmentCount);
  if (fundName !== undefined) updateData.fundName = fundName.trim();
  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

  const paysip = await PaySip.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!paysip) return res.status(404).json({ success: false, message: 'Pay_SIP record not found' });
  res.json({ success: true, paysip, message: 'Pay_SIP record updated successfully' });
});

// DELETE /api/paysip/:id - Delete Pay_SIP entry
router.delete('/:id', async (req, res) => {
  const paysip = await PaySip.findByIdAndDelete(req.params.id);
  if (!paysip) return res.status(404).json({ success: false, message: 'Pay_SIP record not found' });
  res.json({ success: true, message: 'Pay_SIP record deleted successfully' });
});

// POST /api/paysip/remove-duplicates - Purge duplicate Pay_SIP records by folioNumber or phone
router.post('/remove-duplicates', async (req, res) => {
  const paysips = await PaySip.find().sort('createdAt');
  const seenFolios = new Set();
  const duplicateIds = [];

  for (const item of paysips) {
    const key = (item.folioNumber || item.phone || '').trim().toLowerCase();
    if (seenFolios.has(key)) {
      duplicateIds.push(item._id);
    } else {
      seenFolios.add(key);
    }
  }

  if (duplicateIds.length > 0) {
    await PaySip.deleteMany({ _id: { $in: duplicateIds } });
  }

  res.json({ success: true, removed_count: duplicateIds.length, message: `Removed ${duplicateIds.length} duplicate Pay_SIP records.` });
});

module.exports = router;
