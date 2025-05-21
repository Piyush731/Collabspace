// backend/middleware/taskPermissions.js
const Repository = require('../models/Repository');
const Task = require('../models/Task');


exports.verifyTaskAccess = async (req, res, next) => {
  try {
     const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

     const repo = await Repository.findById(task.repository)
      .populate('collaborators.user')
      .populate('owner');

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    
    const isOwner = repo.owner._id.equals(req.user.id);
    const isCollaborator = repo.collaborators.some(
      c => c.user._id.equals(req.user.id)
    );
    
   if (!isOwner && !isCollaborator) {
      return res.status(403).json({ 
        error: 'Access denied. You must be the owner or collaborator' 
      });
    }

    next();
  } catch (err) {
    console.error('Authorization Error:', {
      error: err.message,
      repoId: req.params.repoId,
      userId: req.user.id
    });
    res.status(500).json({ error: 'Server error during authorization' });
  }
};