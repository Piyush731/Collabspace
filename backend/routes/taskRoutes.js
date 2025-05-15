// backend/routes/task.routes.js
const express = require('express');
const router = express.Router();
const { 
  createTask,
  getRepoTasks,
  updateTask,
  deleteTask,
  assignTask,
  mirrorTaskToGitea, 
  createComment
} = require('../controllers/taskController');
const { verifyTaskAccess } = require('../middleware/taskPermissions');

// Fixed route definitions
router.post('/:repoId/tasks', verifyTaskAccess, createTask);
router.get('/:repoId/tasks', verifyTaskAccess, getRepoTasks);
router.put('/:repoId/tasks/:taskId', verifyTaskAccess, updateTask);
router.delete('/:repoId/tasks/:taskId', verifyTaskAccess, deleteTask);
router.post('/:repoId/tasks/:taskId/assign', verifyTaskAccess, assignTask);
router.post('/:repoId/tasks/:taskId/mirror', verifyTaskAccess, mirrorTaskToGitea);
router.post('/:repoId/tasks/:taskId/comment', verifyTaskAccess, createComment );

router.patch('/:id/status', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('repository', '_id');

    const repositoryId = req.body.repositoryId || task.repository?._id;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        repository: repositoryId
      },
      { new: true }
    );

    // Update board accordingly...
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: req.params.userId })
      .populate('repository', 'name _id') // Add population
      .populate('assignees', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;