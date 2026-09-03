const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Inquiries', 'Qualified', 'Proposed', 'Won', 'Lost'],
    default: 'Inquiries',
  },
  read_rate: {
    type: String,
    default: '95%',
  },
  notes: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: 'crm',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', LeadSchema);
