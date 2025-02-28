const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get messages for repository
router.get('/:repoId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      repository: req.params.repoId
    }).populate('sender', 'username email');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new message
router.post('/:repoId', auth, async (req, res) => {
  try {
    const message = new Message({
      content: req.body.content,
      sender: req.user.id,
      repository: req.params.repoId
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});
module.exports = router;