const express = require('express');
const router  = express.Router();
const PaySip  = require('../models/PaySip');

// GET /api/paysip - Fetch all Pay_SIP entries
router.get('/', async (req, res) => {
  const paysips = await PaySip.find().sort('-createdAt');
  res.json({ success: true, paysips, count: paysips.length });
});

// POST /api/paysip - Create new Payslip entry
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const clientName = body.employeeName || body.clientName || 'Employee';
    const phone = body.phone || '9876543210';
    const folioNumber = body.employeeId || body.folioNumber || `EMP-${Date.now()}`;
    const sipAmount = body.netPay || body.sipAmount || 80000;

    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);

    const paysip = await PaySip.create({
      ...body,
      clientName: String(clientName).trim(),
      phone: cleanPhone,
      folioNumber: String(folioNumber).trim(),
      sipAmount: Number(sipAmount)
    });

    res.status(201).json({ success: true, paysip, message: 'Payslip generated and saved successfully in MongoDB! 🎉' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/paysip/:id - Update Payslip entry
router.put('/:id', async (req, res) => {
  try {
    const paysip = await PaySip.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!paysip) return res.status(404).json({ success: false, message: 'Payslip record not found' });
    res.json({ success: true, paysip, message: 'Payslip record updated successfully! 🎉' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
