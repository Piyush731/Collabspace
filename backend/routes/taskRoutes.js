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
  createComment,
  findAndUpdateTask,
  getUserTasks
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
router.patch('/tasks/:taskId/status',verifyTaskAccess, findAndUpdateTask );
router.get('/tasks/user/:userId', verifyTaskAccess, getUserTasks );


module.exports = router;