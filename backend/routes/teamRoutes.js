const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Invite = require('../models/PendingInvite');
const Repository = require('../models/Repository');
const User = require('../models/User'); 

// Send invitation
router.post('/invite', auth, async (req, res) => {
  try {
    const { repoId, email, role } = req.body;
    
    // Check repository access
    const repo = await Repository.findOne({
      _id: repoId,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    
    if (!repo) return res.status(403).json({ error: 'No repository access' });

    // Create invitation
    const invite = new Invite({
      repository: repoId,
      sender: req.user._id,
      recipient: email,
      role
    });

    await invite.save();
    // Send email logic here
    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
router.post('/invite/accept', auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({
      recipient: req.user.email,
      status: 'pending'
    }).populate('repository');

    if (!invite) return res.status(404).json({ error: 'Invite not found' });

    // Add user to repository members
    await Repository.findByIdAndUpdate(
      invite.repository._id,
      { $addToSet: { members: req.user._id } }
    );

    invite.status = 'accepted';
    await invite.save();
    
    res.json({ message: 'Invite accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;