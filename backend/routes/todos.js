const express = require('express');
const router  = express.Router();
const Todo    = require('../models/Todo');

// GET /api/todos - Fetch all todo items
router.get('/', async (req, res) => {
  const todos = await Todo.find().sort('-createdAt');
  res.json({ success: true, todos, count: todos.length });
});

// POST /api/todos - Create new todo item
router.post('/', async (req, res) => {
  const { title, assignee, dueDate, priority, category, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task Title is required.' });
  }

  // Deduplication check: check if task with same title exists
  const existing = await Todo.findOne({ title: title.trim() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'A task with this title already exists in the database.' });
  }

  const initialStatus = status || 'Pending';
  const todo = await Todo.create({
    title: title.trim(),
    assignee: assignee ? assignee.trim() : 'Admin Manager',
    dueDate: dueDate ? dueDate.trim() : 'Today',
    priority: priority || 'High',
    category: category ? category.trim() : 'General',
    status: initialStatus,
    done: initialStatus === 'Completed'
  });

  res.status(201).json({ success: true, todo, message: 'Task saved in MongoDB!' });
});

// PUT /api/todos/:id - Update todo item or update status
router.put('/:id', async (req, res) => {
  const { title, assignee, dueDate, priority, category, done, status } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (assignee !== undefined) updateData.assignee = assignee.trim();
  if (dueDate !== undefined) updateData.dueDate = dueDate.trim();
  if (priority !== undefined) updateData.priority = priority;
  if (category !== undefined) updateData.category = category.trim();

  if (status !== undefined) {
    updateData.status = status;
    updateData.done = (status === 'Completed');
  } else if (done !== undefined) {
    updateData.done = Boolean(done);
    updateData.status = Boolean(done) ? 'Completed' : 'Pending';
  }

  const todo = await Todo.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!todo) return res.status(404).json({ success: false, message: 'Todo task not found' });
  res.json({ success: true, todo, message: 'Task status updated successfully' });
});

// DELETE /api/todos/:id - Delete todo item
router.delete('/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Todo task not found' });
  res.json({ success: true, message: 'Task deleted successfully' });
});

// POST /api/todos/remove-duplicates - Purge duplicate task titles from MongoDB
router.post('/remove-duplicates', async (req, res) => {
  const todos = await Todo.find().sort('createdAt');
  const seenTitles = new Set();
  const duplicateIds = [];

  for (const t of todos) {
    const key = (t.title || '').trim().toLowerCase();
    if (seenTitles.has(key)) {
      duplicateIds.push(t._id);
    } else {
      seenTitles.add(key);
    }
  }

  if (duplicateIds.length > 0) {
    await Todo.deleteMany({ _id: { $in: duplicateIds } });
  }

  res.json({ success: true, removed_count: duplicateIds.length, message: `Removed ${duplicateIds.length} duplicate tasks from database.` });
});

module.exports = router;
