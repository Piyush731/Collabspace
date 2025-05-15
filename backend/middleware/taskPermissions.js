// backend/middleware/taskPermissions.js
exports.verifyTaskAccess = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.repoId)
      .populate('collaborators.user');
    
    const isCollaborator = repo.collaborators.some(
      c => c.user._id.equals(req.user.id)
    );
    
    if (!isCollaborator) {
      return res.status(403).json({ error: 'Access denied to repository tasks' });
    }
    next();
  } catch (err) {
    next(err);
  }
};