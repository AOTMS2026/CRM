const mongoose = require('mongoose');
const crypto   = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    default: '',
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'user'],
    default: 'employee',
  },
  designation: {
    type: String,
    default: 'Operations Specialist',
    trim: true,
  },
  department: {
    type: String,
    default: 'General Operations',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing helper using crypto PBKDF2
UserSchema.statics.hashPassword = function(password) {
  const salt = process.env.JWT_SECRET || 'aotms_secret_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.verifyPassword = function(password) {
  const hash = UserSchema.statics.hashPassword(password);
  return this.password === hash;
};

module.exports = mongoose.model('User', UserSchema);
