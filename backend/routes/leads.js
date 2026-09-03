const express = require('express');
const router  = express.Router();
const Lead     = require('../models/Lead');
const Contact  = require('../models/Contact');
const Template = require('../models/Template');

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

// POST /api/leads/send-single-whatsapp - 1-Click Test WhatsApp Message
router.post('/send-single-whatsapp', async (req, res) => {
  try {
    const { phone, template_name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const cleanP = cleanPhone(phone);
    if (cleanP.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    let template = null;
    if (template_name) {
      template = await Template.findOne({
        $or: [{ name: template_name }, { title: template_name }, { metaTemplateId: template_name }]
      });
    }

    if (!template) {
      template = await Template.findOne({ metaStatus: 'APPROVED' }) || {
        name: template_name || 'hello_world',
        language: 'en_US',
        components: [{ type: 'BODY', text: 'Hello from AOTMS Enterprise Automation!' }],
        title: 'Hello',
        message: 'Hello from AOTMS Enterprise Automation!'
      };
    }

    const ConversationFlow = require('../utils/conversationFlow').ConversationFlow;
    const sendRes = await ConversationFlow.startMetaTemplate(cleanP, template);
    
    res.json({
      success: true,
      message: `Test message sent to +91 ${cleanP}!`,
      details: sendRes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads/whatsapp-blast - Dispatch Batch WhatsApp Broadcast
router.post('/whatsapp-blast', async (req, res) => {
  try {
    const { template_name, lead_ids, phones, sample_values } = req.body;
    if (!template_name) {
      return res.status(400).json({ success: false, message: 'template_name is required.' });
    }

    // Find target template
    let template = await Template.findOne({
      $or: [{ name: template_name }, { title: template_name }, { metaTemplateId: template_name }]
    });

    if (!template) {
      template = {
        name: template_name,
        language: 'en_US',
        category: 'MARKETING',
        components: [{ type: 'BODY', text: 'Hello {{1}}!' }],
        message: 'Hello {{1}}!'
      };
    }

    // Gather target phone numbers
    const targetPhones = new Set();

    if (Array.isArray(phones) && phones.length > 0) {
      phones.forEach(p => {
        const cp = cleanPhone(p);
        if (cp.length === 10) targetPhones.add(cp);
      });
    }

    if (Array.isArray(lead_ids) && lead_ids.length > 0) {
      // Could be Lead IDs, Contact IDs, or raw 10-digit phone strings
      for (const item of lead_ids) {
        const rawP = cleanPhone(item);
        if (rawP.length === 10) {
          targetPhones.add(rawP);
          continue;
        }

        // Try finding by Mongoose ObjectId in Lead or Contact
        if (String(item).match(/^[0-9a-fA-F]{24}$/)) {
          const l = await Lead.findById(item);
          if (l && l.phone) targetPhones.add(cleanPhone(l.phone));
          
          const c = await Contact.findById(item);
          if (c && c.phone) targetPhones.add(cleanPhone(c.phone));
        }
      }
    }

    const phoneList = Array.from(targetPhones);
    if (phoneList.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid 10-digit target recipients found.' });
    }

    console.log(`🚀 Dispatching WhatsApp Blast to ${phoneList.length} recipients for template '${template.name}'...`);

    const ConversationFlow = require('../utils/conversationFlow').ConversationFlow;
    let successful = 0, failed = 0;

    for (let i = 0; i < phoneList.length; i++) {
      const p = phoneList[i];
      try {
        await ConversationFlow.startMetaTemplate(p, template);
        successful++;
      } catch (err) {
        console.error(`❌ Failed blast to ${p}:`, err.message);
        failed++;
      }
    }

    res.json({
      success: true,
      successful,
      failed,
      total: phoneList.length,
      message: `WhatsApp Blast executed! Successfully sent to ${successful} recipients (${failed} failed).`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
