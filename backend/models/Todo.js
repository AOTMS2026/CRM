const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  assignee: { type: String, default: 'Admin Manager', trim: true },
  dueDate:  { type: String, required: true, trim: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Normal'], default: 'High' },
  category: { type: String, default: 'General', trim: true },
  status:   { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  done:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);
