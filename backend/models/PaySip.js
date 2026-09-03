const mongoose = require('mongoose');

const paySipSchema = new mongoose.Schema({
  clientName:       { type: String, required: true, trim: true },
  phone:            { type: String, required: true, trim: true },
  folioNumber:      { type: String, required: true, unique: true, trim: true },
  sipAmount:        { type: Number, required: true },
  monthlyDay:       { type: Number, default: 10 },
  installmentCount: { type: Number, default: 12 },
  fundName:         { type: String, default: 'HDFC Flexi Cap Fund', trim: true },
  paymentStatus:    { type: String, enum: ['Active', 'Pending', 'Completed', 'Paused'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('PaySip', paySipSchema);
