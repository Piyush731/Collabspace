const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Repository = require('../models/Repository');  // Add this 
const { verifyToken } = require("../middleware/auth");

const auth = require('../middleware/auth');

// Get messages for repository
router.get('/repo/:repoId', auth, async (req, res) => {
  try {
    // Add repository access validation
    const repo = await Repository.findOne({
      _id: req.params.repoId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!repo) return res.status(403).json({ error: 'Access denied' });

    const messages = await Message.find({
      repository: req.params.repoId
    }).populate('sender', 'username email')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new message
router.post('/repo/:repoId', auth, async (req, res) => {
  try {
    const message = await Message.create({
      content: req.body.content,
      sender: req.user.id,
      repository: req.params.repoId
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});
module.exports = router;