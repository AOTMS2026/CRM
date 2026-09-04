const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Template = require('../models/Template');
const Contact  = require('../models/Contact');
const { getClient, initWhatsApp, getStatus } = require('../utils/whatsappService');
const { ConversationFlow } = require('../utils/conversationFlow');
const { createTemplateOnMeta, getTemplateStatusFromMeta, uploadMediaToMeta, fetchAllTemplatesFromMeta } = require('../utils/metaTemplateService');
const { uploadToCloudinary, uploadUrlToCloudinary } = require('../utils/cloudinaryService');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/campaigns/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const fs  = require('fs');
const dir = path.join(__dirname, '../uploads/campaigns/');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const sendDelay = (base = 4000) => {
  const jitter = Math.floor(Math.random() * 2000) - 1000;
  return sleep(Math.max(2500, base + jitter));
};
// ── Meta Broadcast runner ─────────────────────────────────────────────────────
const runMetaBroadcast = async (template, phoneList) => {
  let sent = 0, failed = 0;
  console.log(`🚀 Bulk Meta send to ${phoneList.length} contacts...`);

  // Meta Cloud API is stateless and doesn't need socket connection waiting!
  for (let i = 0; i < phoneList.length; i++) {
    const phone = phoneList[i];
    try {
      const sendRes = await ConversationFlow.startMetaTemplate(phone, template);
      const wamid = sendRes?.messages?.[0]?.id;
      if (wamid) {
        const MessageLog = require('../models/MessageLog');
        await MessageLog.findOneAndUpdate(
          { wamid },
          {
            $set: {
              wamid,
              phone,
              status: 'sent',
              timestamp: new Date(),
              phoneId: process.env.META_WA_PHONE_NUMBER_ID,
              wabaId: process.env.META_WA_BUSINESS_ACCOUNT_ID
            }
          },
          { upsert: true, new: true }
        );
      }
      await Contact.findOneAndUpdate({ phone: phone }, { $inc: { templatesSent: 1 }, lastStatus: 'sent' }, { upsert: true });
      sent++;
      console.log(`✅ [${i + 1}/${phoneList.length}] Sent Meta Template to ${phone} (wamid: ${wamid})`);
    } catch (e) {
      failed++;
      console.error(`❌ [${i + 1}/${phoneList.length}] Failed ${phone}:`, e.message);
    }
    // Meta allows higher limits, so delay can be smaller than Baileys
    if (i < phoneList.length - 1) await sendDelay(500); 
  }

  template.totalSent   = (template.totalSent || 0) + sent;
  template.totalFailed = (template.totalFailed || 0) + failed;
  template.status      = sent > 0 ? 'completed' : 'failed';
  template.lastRunAt   = new Date();
  await template.save();
  console.log(`🏁 Meta Broadcast Done: ${sent} sent, ${failed} failed`);
};

// Legacy Baileys endpoint /api/template/send removed.

// POST /api/template/send-meta
// Send an approved Meta Template to users
router.post('/send-meta', async (req, res) => {
  const { templateId, phones } = req.body;
  if (!templateId) return res.status(400).json({ success: false, message: 'Template ID required' });

  const template = await Template.findById(templateId);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  
  if (!template.metaTemplateId) {
    return res.status(400).json({ success: false, message: 'This template does not have a valid Meta Template ID attached.' });
  }

  // Strict Validation: Fetch from Meta to ensure it's still approved right before sending
  try {
    const metaData = await getTemplateStatusFromMeta(template.metaTemplateId);
    if (!metaData || metaData.status !== 'APPROVED') {
       return res.status(400).json({ success: false, message: `Template is not APPROVED on Meta. Current status: ${metaData?.status || 'UNKNOWN'}` });
    }
    // Update local status just in case
    if (template.metaStatus !== 'APPROVED') {
      template.metaStatus = 'APPROVED';
      await template.save();
    }
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid Meta Template ID or template is no longer accessible.' });
  }

  let phoneList = [];
  try { 
    const parsed = JSON.parse(phones || '[]'); 
    if (Array.isArray(parsed)) phoneList = parsed;
    else phoneList = String(phones || '').split(',').map(p => p.trim()).filter(Boolean);
  }
  catch { phoneList = String(phones || '').split(',').map(p => p.trim()).filter(Boolean); }

  if (!phoneList.length) {
    const contacts = await Contact.find({ optedOut: false });
    phoneList = contacts.map(c => c.phone);
  }
  if (!phoneList.length) return res.status(400).json({ success: false, message: 'No contacts to send to' });

  res.json({ success: true, total: phoneList.length, message: 'Meta Broadcast started!' });
  runMetaBroadcast(template, phoneList);
});

// POST /api/template/schedule
router.post('/schedule', upload.single('image'), async (req, res) => {
  const { title, message, footer, phones, scheduleTime, repeatDaily, scheduleDays } = req.body;
  if (!scheduleTime) return res.status(400).json({ success: false, message: 'scheduleTime required (HH:MM)' });

  let phoneList = [];
  try { 
    const parsed = JSON.parse(phones || '[]'); 
    if (Array.isArray(parsed)) phoneList = parsed;
    else phoneList = String(phones || '').split(',').map(p => p.trim()).filter(Boolean);
  }
  catch { phoneList = String(phones || '').split(',').map(p => p.trim()).filter(Boolean); }

  if (!phoneList.length) {
    const contacts = await Contact.find({ optedOut: false });
    phoneList = contacts.map(c => c.phone);
  }

  const [hh, mm] = scheduleTime.split(':').map(Number);
  const next = new Date();
  next.setHours(hh, mm, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);

  let cloudinaryUrl = '';
  if (req.file) {
    try {
      cloudinaryUrl = await uploadToCloudinary(req.file.path, 'zest_eat_schedules');
    } catch (e) {
      console.error('Cloudinary schedule upload failed:', e.message);
    }
  }

  const template = new Template({
    title: title || 'Fresh Stock Available!', message, footer: footer || '',
    imageUrl: cloudinaryUrl || (req.file ? `/uploads/campaigns/${req.file.filename}` : ''),
    contacts: phoneList, status: 'scheduled',
    isScheduled: true, scheduleTime,
    repeatDaily: repeatDaily === 'true' || repeatDaily === true,
    scheduleDays: scheduleDays ? JSON.parse(scheduleDays) : [],
    nextRunAt: next, isActive: true,
  });
  await template.save();
  res.json({ success: true, template, message: `Scheduled for ${scheduleTime}` });
});

router.get('/schedules', async (req, res) => {
  const schedules = await Template.find({ isScheduled: true }).sort('-createdAt');
  res.json({ success: true, schedules });
});

router.put('/schedule/:id/toggle', async (req, res) => {
  const t = await Template.findById(req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  t.isActive = !t.isActive;
  await t.save();
  res.json({ success: true, template: t });
});

router.delete('/schedule/:id', async (req, res) => {
  await Template.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// PUT /api/template/:id - Update template details or status
router.put('/:id', async (req, res) => {
  try {
    const { name, category, language, message, footer, imageUrl, metaStatus, status } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (category !== undefined) updateData.category = category;
    if (language !== undefined) updateData.language = language;
    if (message !== undefined) {
      updateData.message = String(message).trim();
      updateData.title = String(message).trim();
    }
    if (footer !== undefined) updateData.footer = String(footer).trim();
    if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
    if (metaStatus !== undefined) updateData.metaStatus = metaStatus;
    if (status !== undefined) updateData.status = status;

    let template = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      template = await Template.findByIdAndUpdate(req.params.id, updateData, { new: true });
    }
    if (!template) {
      template = await Template.findOneAndUpdate(
        { $or: [{ name: req.params.id }, { metaTemplateId: req.params.id }] },
        updateData,
        { new: true }
      );
    }

    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template, message: 'Template updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let deleted = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Template.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      deleted = await Template.findOneAndDelete({
        $or: [{ name: req.params.id }, { metaTemplateId: req.params.id }]
      });
    }
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  const currentWaba = process.env.META_WA_BUSINESS_ACCOUNT_ID;
  const filter = { isScheduled: { $ne: true } };
  if (currentWaba) {
    filter.wabaId = currentWaba;
  }
  const templates = await Template.find(filter).sort('-createdAt');
  res.json({ success: true, templates, currentWabaId: currentWaba });
});

// POST /api/template and /api/template/meta
// Create a new template directly on Meta WhatsApp Cloud API
const createMetaTemplateHandler = async (req, res) => {
  let { name, language, category, components, header_type, header_text, header_image_url, body_text, footer_text, buttons, sample_values } = req.body;
  
  if (!language) language = 'en_US';
  if (!category) category = 'MARKETING';

  if (typeof components === 'string') {
    try { components = JSON.parse(components); } catch (e) {}
  }

  if (!components || !Array.isArray(components) || components.length === 0) {
    if (body_text) {
      components = [];
      if (header_type === 'TEXT' && header_text) {
        components.push({ type: 'HEADER', format: 'TEXT', text: header_text });
      } else if (header_type === 'IMAGE' || header_image_url) {
        components.push({ type: 'HEADER', format: 'IMAGE' });
      }
      const bodyComp = { type: 'BODY', text: body_text };
      if (Array.isArray(sample_values) && sample_values.length > 0) {
        bodyComp.example = { body_text: [sample_values] };
      }
      components.push(bodyComp);
      if (footer_text) {
        components.push({ type: 'FOOTER', text: footer_text });
      }
      if (Array.isArray(buttons) && buttons.length > 0) {
        const formattedBtns = buttons.map(b => {
          if (b.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
          if (b.type === 'URL') return { type: 'URL', text: b.text, url: b.url };
          return { type: 'QUICK_REPLY', text: b.text || 'Reply' };
        });
        components.push({ type: 'BUTTONS', buttons: formattedBtns });
      }
    }
  }

  if (!name || !components || !Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required Meta template fields (name, body text/components)' });
  }

  try {
    // 1. Upload media if provided
    let cloudinaryUrl = null;
    if (req.file) {
      // Upload to Cloudinary for permanent storage and preview
      try {
        cloudinaryUrl = await uploadToCloudinary(req.file.path, 'zest_eat_templates');
      } catch (err) {
        console.error('Cloudinary template upload failed:', err.message);
      }

      const handle = await uploadMediaToMeta(req.file.path, req.file.mimetype, req.file.size);
      
      // Inject handle into HEADER component
      const headerIndex = components.findIndex(c => c.type === 'HEADER');
      if (headerIndex !== -1) {
        components[headerIndex].example = { header_handle: [handle] };
      }
    }

    const metaResponse = await createTemplateOnMeta(name, language, category, components);
    
    // 2b. Upload media again but specifically for sending (to get a media_id instead of a handle)
    let mediaId = null;
    if (req.file) {
      const { uploadMediaForSending } = require('../utils/metaTemplateService');
      try {
        mediaId = await uploadMediaForSending(req.file.path, req.file.mimetype);
      } catch (err) {
        console.error('Failed to upload media for sending:', err.message);
      }
    }
    
    // 3. Save in database
    const template = new Template({
      name,
      language,
      category,
      components,
      imageUrl: cloudinaryUrl || (req.file ? `/uploads/${req.file.filename}` : ''),
      mediaId, // Save the Meta media ID for sending
      metaTemplateId: metaResponse.id,
      metaStatus: metaResponse.status || 'PENDING',
      wabaId: process.env.META_WA_BUSINESS_ACCOUNT_ID || '',
      title: name, // fallback display
      message: Array.isArray(components) ? (components.find(c => c.type === 'BODY')?.text || 'Meta Template') : 'Meta Template',
      status: 'draft'
    });
    
    await template.save();
    
    res.json({ success: true, template, message: 'Template submitted to Meta successfully!' });
  } catch (error) {
    console.error('Meta Template API Error:', error.response?.data || error.message);
    try {
      const template = new Template({
        name,
        language: language || 'en_US',
        category: category || 'MARKETING',
        components,
        imageUrl: req.file ? `/uploads/campaigns/${req.file.filename}` : '',
        metaTemplateId: 'local_' + Date.now(),
        metaStatus: 'PENDING',
        title: name,
        message: Array.isArray(components) ? (components.find(c => c.type === 'BODY')?.text || 'Template') : 'Template',
        status: 'draft'
      });
      await template.save();
      return res.json({ 
        success: true, 
        template, 
        message: 'Template created successfully in Zest Eat! (Meta sync: ' + (error.response?.data?.error?.message || error.message) + ')' 
      });
    } catch (saveErr) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to create template' });
    }
  }
};

router.post('/meta', upload.single('media'), createMetaTemplateHandler);
router.post('/', upload.single('media'), createMetaTemplateHandler);

// POST /api/template/import-meta
// Import a template from Meta by its ID
router.post('/import-meta', async (req, res) => {
  const { metaTemplateId, imageUrl } = req.body;
  
  if (!metaTemplateId) {
    return res.status(400).json({ success: false, message: 'Meta Template ID is required' });
  }

  try {
    const metaData = await getTemplateStatusFromMeta(metaTemplateId);
    if (!metaData || !metaData.name) {
      return res.status(404).json({ success: false, message: 'Template not found on Meta' });
    }

    // Check if it already exists
    let template = await Template.findOne({ metaTemplateId });
    if (template) {
      return res.status(400).json({ success: false, message: 'Template already exists in database' });
    }

    template = new Template({
      name: metaData.name,
      language: metaData.language,
      category: metaData.category,
      components: metaData.components || [],
      metaTemplateId: metaData.id,
      metaStatus: metaData.status || 'PENDING',
      imageUrl: imageUrl || '', // Save user provided imageUrl if applicable
      title: metaData.name,
      message: 'Imported Meta Template',
      status: 'draft'
    });

    await template.save();

    res.json({ success: true, template, message: 'Template imported successfully' });
  } catch (error) {
    console.error('Import Meta Template Error:', error);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message || 'Failed to import template' });
  }
});

// GET /api/template and /api/integrations/whatsapp/templates
const getTemplatesHandler = async (req, res) => {
  try {
    const templates = await Template.find().sort('-createdAt');
    res.json({ success: true, templates, count: templates.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.get('/', getTemplatesHandler);
router.get('/list', getTemplatesHandler);

// POST /api/template/sync-meta (or /sync, /sync-templates)
// Synchronize all templates directly from Meta Cloud API into the database
const syncMetaHandler = async (req, res) => {
  try {
    const currentWaba = process.env.META_WA_BUSINESS_ACCOUNT_ID;
    const metaTemplates = await fetchAllTemplatesFromMeta();
    let syncedCount = 0;
    const activeMetaIds = metaTemplates.map(t => t.id);

    for (const mt of metaTemplates) {
      const existing = await Template.findOne({
        $or: [{ metaTemplateId: mt.id }, { name: mt.name }]
      });

      const bodyComp = mt.components?.find(c => c.type === 'BODY');
      const footerComp = mt.components?.find(c => c.type === 'FOOTER');
      const headerComp = mt.components?.find(c => c.type === 'HEADER');

      if (existing) {
        // Deduplicate: remove any other records with this name or ID
        await Template.deleteMany({
          _id: { $ne: existing._id },
          $or: [{ metaTemplateId: mt.id }, { name: mt.name }]
        });

        existing.name = mt.name;
        existing.metaTemplateId = mt.id;
        existing.metaStatus = mt.status || existing.metaStatus;
        existing.components = mt.components || existing.components;
        existing.language = mt.language || existing.language;
        existing.category = mt.category || existing.category;
        existing.wabaId = currentWaba;
        if (bodyComp?.text) existing.message = bodyComp.text;
        if (footerComp?.text) existing.footer = footerComp.text;

        // Auto-host to Cloudinary if not already on Cloudinary
        const handleUrl = headerComp?.example?.header_handle?.[0];
        if (!existing.imageUrl || !existing.imageUrl.includes('cloudinary.com')) {
          if (handleUrl && handleUrl.startsWith('http')) {
            try {
              const cloudUrl = await uploadUrlToCloudinary(handleUrl, 'zest_eat_templates');
              if (cloudUrl) existing.imageUrl = cloudUrl;
            } catch (e) {}
          }
        }

        await existing.save();
        syncedCount++;
      } else {
        let initialImage = '';
        const handleUrl = headerComp?.example?.header_handle?.[0];
        if (handleUrl && handleUrl.startsWith('http')) {
          try {
            initialImage = await uploadUrlToCloudinary(handleUrl, 'zest_eat_templates') || handleUrl;
          } catch (e) {
            initialImage = handleUrl;
          }
        }

        const created = await Template.create({
          name: mt.name,
          language: mt.language,
          category: mt.category,
          components: mt.components || [],
          metaTemplateId: mt.id,
          metaStatus: mt.status || 'APPROVED',
          wabaId: currentWaba,
          title: mt.name,
          message: bodyComp?.text || mt.name,
          footer: footerComp?.text || '',
          imageUrl: initialImage,
          status: 'draft'
        });

        await Template.deleteMany({
          _id: { $ne: created._id },
          $or: [{ metaTemplateId: mt.id }, { name: mt.name }]
        });
        syncedCount++;
      }
    }

    // Clean up any templates not belonging to the current Meta account
    if (currentWaba && activeMetaIds.length > 0) {
      await Template.deleteMany({
        $or: [
          { wabaId: { $ne: currentWaba } },
          { metaTemplateId: { $nin: activeMetaIds } }
        ],
        isScheduled: { $ne: true }
      });
    }

    const filter = { isScheduled: { $ne: true } };
    if (currentWaba) {
      filter.wabaId = currentWaba;
    }
    const all = await Template.find(filter).sort('-createdAt');
    res.json({ 
      success: true, 
      count: syncedCount, 
      templates: all, 
      currentWabaId: currentWaba, 
      message: `Successfully synced ${all.length} templates for Meta Account (${currentWaba})!` 
    });
  } catch (error) {
    console.error('❌ Meta Sync Warning (falling back to database templates):', error.response?.data || error.message);
    try {
      const existingTemplates = await Template.find({ isScheduled: { $ne: true } }).sort('-createdAt');
      return res.json({
        success: true,
        count: 0,
        templates: existingTemplates,
        metaOffline: true,
        message: 'Loaded templates from database. (Meta API offline or account unreachable: ' + (error.response?.data?.error?.message || error.message) + ')'
      });
    } catch (dbErr) {
      res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
    }
  }
};

router.post('/sync-meta', syncMetaHandler);
router.post('/sync', syncMetaHandler);
router.post('/sync-templates', syncMetaHandler);

// GET /api/template/meta/:id/status
// Check the approval status of a Meta template
router.get('/meta/:id/status', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template || !template.metaTemplateId) {
      return res.status(404).json({ success: false, message: 'Meta template not found' });
    }

    if (template.metaTemplateId.startsWith('local_')) {
      return res.status(400).json({ 
        success: false, 
        message: 'This template was saved as a local draft because initial Meta sync failed. Please recreate or edit it.' 
      });
    }
    
    const metaData = await getTemplateStatusFromMeta(template.metaTemplateId);
    
    if (metaData && metaData.status) {
      template.metaStatus = metaData.status;
      await template.save();
    }
    
    res.json({ success: true, status: template.metaStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
  }
});

// GET /api/template/stats/summary
// Fetches high level metrics and chart data based on MessageLog tracking
router.get('/stats/summary', async (req, res) => {
  try {
    const MessageLog = require('../models/MessageLog');
    
    const currentWaba = process.env.META_WA_BUSINESS_ACCOUNT_ID;
    const currentPhone = process.env.META_WA_PHONE_NUMBER_ID;

    // Filter logs for this phone or waba if specified
    const logFilter = {};
    if (currentPhone || currentWaba) {
      logFilter.$or = [
        ...(currentPhone ? [{ phoneId: currentPhone }] : []),
        ...(currentWaba ? [{ wabaId: currentWaba }] : []),
        { phoneId: null, wabaId: null }
      ];
    }
    
    // Global counts based on latest webhook states
    const logs = await MessageLog.find(logFilter);
    
    let sent = 0;
    let delivered = 0;
    let read = 0;
    let failed = 0;
    
    logs.forEach(log => {
      // If it reached delivered or read, it was also sent
      if (['sent', 'delivered', 'read'].includes(log.status)) sent++;
      if (['delivered', 'read'].includes(log.status)) delivered++;
      if (log.status === 'read') read++;
      if (log.status === 'failed') failed++;
    });

    const templateFilter = { metaStatus: 'APPROVED', isActive: true };
    if (currentWaba) {
      templateFilter.wabaId = currentWaba;
    }

    const activeTemplates = await Template.countDocuments(templateFilter);
    const totalContacts = await Contact.countDocuments({ optedOut: false });
    const totalCampaigns = await Template.countDocuments({ contacts: { $not: { $size: 0 } } });

    res.json({
      success: true,
      stats: {
        sent,
        delivered,
        read,
        failed,
        activeTemplates,
        totalContacts,
        totalCampaigns,
        wabaId: currentWaba,
        phoneId: currentPhone
      },
      chartData: logs
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

const runScheduledTemplates = async () => {
  const now = new Date();
  const due = await Template.find({ isScheduled: true, isActive: true, nextRunAt: { $lte: now }, status: { $ne: 'sending' } });

  for (const t of due) {
    console.log(`⏰ Running scheduled broadcast: ${t.title}`);
    t.status = 'sending';
    await t.save();
        runMetaBroadcast(t, t.contacts).then(async () => {
      if (t.repeatDaily) {
        const next = new Date(t.nextRunAt);
        next.setDate(next.getDate() + 1);
        await Template.findByIdAndUpdate(t._id, { nextRunAt: next, status: 'scheduled' });
      }
    });
  }
};

module.exports = router;
module.exports.runScheduledTemplates = runScheduledTemplates;