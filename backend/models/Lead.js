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
  identity: {
    type: String,
    default: 'SAP FICO',
    trim: true,
  },
  employeeName: {
    type: String,
    default: 'Jayaveer',
    trim: true,
  },
  leadStatusUpdate: {
    type: String,
    default: '',
    trim: true,
  },
  secondUpdate: {
    type: String,
    default: '',
    trim: true,
  },
  finalUpdate: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    default: 'Intrest',
    trim: true,
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
