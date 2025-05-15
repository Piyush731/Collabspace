const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Task = require('../models/Task');
const Repository = require('../models/Repository');

// GET /api/search?q=term -> search tasks and repositories for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const q = req.query.q || '';
    const userId = req.user._id;
    // Search tasks assigned to user
    const tasks = await Task.find({
      assignees: userId,
      title: { $regex: q, $options: 'i' }
    })
      .limit(10)
      .select('title status repository')
      .populate('repository', 'name');
    // Search repositories owned or collaborated by user
    const repos = await Repository.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ],
      name: { $regex: q, $options: 'i' }
    })
      .limit(10)
      .select('name description collaborators');
    res.json({ tasks, repositories: repos });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router; 