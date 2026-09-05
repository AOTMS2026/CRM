const mongoose = require('mongoose');

const paySipSchema = new mongoose.Schema({
  // Legacy / Basic fields
  clientName:       { type: String, trim: true },
  phone:            { type: String, trim: true },
  folioNumber:      { type: String, trim: true },
  sipAmount:        { type: Number },
  monthlyDay:       { type: Number, default: 10 },
  installmentCount: { type: Number, default: 12 },
  fundName:         { type: String, default: 'Academy of Tech Masters', trim: true },
  paymentStatus:    { type: String, default: 'Active' },

  // Employee Payslip Fields
  employeeName:      { type: String, trim: true },
  employeeId:        { type: String, trim: true },
  joiningDate:       { type: String, trim: true },
  designation:       { type: String, trim: true },
  department:        { type: String, trim: true },
  location:          { type: String, trim: true },
  effectiveWorkDays: { type: Number, default: 31 },
  lop:               { type: Number, default: 0 },
  monthYear:         { type: String, default: 'March 2026' },

  // Bank & Statutory Details
  bankName:          { type: String, trim: true },
  bankAccountNo:     { type: String, trim: true },
  panNumber:         { type: String, trim: true },
  pfNo:              { type: String, trim: true },
  pfUan:             { type: String, trim: true },

  // Salary Breakdown
  basic:             { type: Number, default: 48120 },
  hra:               { type: Number, default: 14436 },
  conveyance:        { type: Number, default: 2500 },
  medicalAllowance:  { type: Number, default: 2500 },
  specialAllowance:  { type: Number, default: 10644 },
  incentive:         { type: Number, default: 0 },
  foodAllowance:     { type: Number, default: 2000 },
  profTax:           { type: Number, default: 200 },
  totalEarnings:     { type: Number, default: 80200 },
  totalDeductions:   { type: Number, default: 200 },
  netPay:            { type: Number, default: 80000 },
  netPayWords:       { type: String, default: 'Rupees Eighty Thousand Only' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('PaySip', paySipSchema);

