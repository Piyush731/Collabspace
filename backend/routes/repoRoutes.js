const express = require('express'); 
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Repository = require('../models/Repository');
const router = new express.Router();

// Create repository
router.post('/repos', auth, async (req, res) => {
  const { name, type } = req.body;

  // Validate input
  if (!name || !type) {
    return res.status(400).send({ error: 'Name and type are required' });
  }

  // Check if repository name already exists for the user
  try {
    const existingRepo = await Repository.findOne({ name, owner: req.user._id });
    if (existingRepo) {
      return res.status(400).send({ error: 'Repository name already exists' });
    }

    const repo = new Repository({
      name,
      type,
      owner: req.user._id,
    });

    await repo.save();
    res.status(201).send(repo);
  } catch (e) {
    res.status(500).send({ error: 'Failed to create repository', details: e.message });
  }
});

// Get user repositories
router.get('/repos/my-repos', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const repos = await Repository.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'username email') // Only include necessary owner fields
    .populate('members', 'username email'); // Only include necessary member fields

    if (repos.length === 0) {
      return res.status(404).send({ message: 'No repositories found' });
    }

    res.send(repos);
  } catch (e) {
    res.status(500).send({ error: 'Failed to fetch repositories', details: e.message });
  }
});

// Get a single repository by ID
router.get('/repos/:id', auth, async (req, res) => {
  try {
    const repo = await Repository.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('members', 'username email');

    if (!repo) {
      return res.status(404).send({ error: 'Repository not found or access denied' });
    }

    res.send(repo);
  } catch (e) {
    res.status(500).send({ error: 'Failed to fetch repository', details: e.message });
  }
});

// Update repository (name, type, or members)
router.patch('/repos/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'type', 'members'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const repo = await Repository.findOne({
      _id: req.params.id,
      owner: req.user._id // Only the owner can update the repository
    });

    if (!repo) {
      return res.status(404).send({ error: 'Repository not found or access denied' });
    }

    updates.forEach(update => repo[update] = req.body[update]);
    await repo.save();
    res.send(repo);
  } catch (e) {
    res.status(500).send({ error: 'Failed to update repository', details: e.message });
  }
});

// Delete repository
router.delete('/repos/:id', auth, async (req, res) => {
  try {
    const repo = await Repository.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id // Only the owner can delete the repository
    });

    if (!repo) {
      return res.status(404).send({ error: 'Repository not found or access denied' });
    }

    res.send({ message: 'Repository deleted successfully' });
  } catch (e) {
    res.status(500).send({ error: 'Failed to delete repository', details: e.message });
  }
});

module.exports = router;