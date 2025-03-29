const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const taskController = require('../controllers/taskController');
const checkRepoAccess = require('../middleware/checkRepoAccess');

// const {
//   createTask,
//   getTasksByRepo,
//   updateTask,
//   deleteTask,
//   addComment
// } = require('../controllers/taskController');

// router.post('/', auth, createTask);
// router.get('/:repoId', auth, getTasksByRepo);
// router.put('/:id', auth, updateTask);
// router.delete('/:id', auth, deleteTask);
// router.post('/:id/comments', auth, addComment); 

// Create a new task
router.post(
  '/:repoId',
  [
    auth,
    checkRepoAccess,
    check('title', 'Title is required').not().isEmpty(),
    check('priority', 'Invalid priority').isIn(['Low', 'Medium', 'High'])
  ],
  taskController.createTask
);

// Get tasks for a repository
router.get(
  '/:repoId', 
  [auth, checkRepoAccess], 
  taskController.getTasksByRepo
);

// Update a task
router.put(
  '/:id',
  [
    auth,
    check('status', 'Invalid status').optional().isIn(['To Do', 'In Progress', 'Done']),
    check('priority', 'Invalid priority').optional().isIn(['Low', 'Medium', 'High'])
  ],
  taskController.updateTask
);

// Delete a task
router.delete('/:id', auth, taskController.deleteTask);

// Add comment to task
router.post(
  '/:id/comments',
  [
    auth,
    check('text', 'Comment text is required').not().isEmpty()
  ],
  taskController.addComment
);

router.get('/grouped-by-repo', async (req, res) => {
    try {
      const tasks = await Task.aggregate([
        {
          $group: {
            _id: "$repository",
            tasks: { $push: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router; 