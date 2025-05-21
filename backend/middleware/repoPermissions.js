const Repository = require('../models/Repository');

exports.verifyRepoAccess = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.repoId)
      .populate('collaborators.user owner');

    if (!repo) return res.status(404).json({ error: 'RepoPermissions Repository not found' });

    const isAllowed = repo.owner._id.equals(req.user.id) || 
      repo.collaborators.some(c => c.user._id.equals(req.user.id));

    if (!isAllowed) return res.status(403).json({ error: 'Access denied' });
    
    next();
  } catch (err) {
    console.error('Repo access error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};