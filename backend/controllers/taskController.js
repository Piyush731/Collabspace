// backend/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');
const Repository = require('../models/Repository');
const Board = require('../models/Board');

exports.assignTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignees');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newAssignees = req.body.assignees || []; // Assuming you send an array of assignee IDs
    task.assignees = newAssignees; // Directly assign the new assignees

    // Save the changes
    await task.save();

    // Emit task assignment event to connected clients using Socket.IO
    const eventPayload = {
      task: task,
      action: 'assign',
      assignees: newAssignees // Send updated assignees array
    };
    const repoRoom = `repo-${req.params.repoId}`;
    req.io.to(repoRoom).emit('taskUpdate', eventPayload);

    res.status(200).json(task);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Error assigning task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit task update event to connected clients using Socket.IO
    const eventPayload = {
      task: task,
      action: 'update'
    };
    const repoRoom = `repo-${req.params.repoId}`;
    req.io.to(repoRoom).emit('taskUpdate', eventPayload);

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

exports.createComment = async (req, res) => {

  try {
    const { repoId, taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newComment = {
      text,
      author: userId,
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

   // Detect @mentions using regex
  const mentions = newComment.text.match(/@(\w+)/g) || [];
  
  mentions.forEach(async username => {
    const user = await User.findOne({ username });
    if(user) {
      user.notifications.push({
        type: 'mention',
        task: newComment,
        message: `Mentioned in comment on ${task.title}`
      });
      await user.save();
      
      // Send real-time notification
      req.io.to(`user-${user._id}`).emit('new-notification', user.notifications);
    }
  });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 exports.getRepoTasks = async (req, res) => {
 try {
    const { repoId } = req.params;
    const tasks = await Task.find({ repository: repoId })
      .populate('assignees', 'username','repository')
      .sort({ createdAt: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// In taskController.js - Fix createTask
exports.createTask = async (req, res) => {
  try {
    const { repoId } = req.params;
    const taskData = req.body;

    // Add validation for repository existence
    const repoExists = await Repository.exists({ _id: repoId });
    if (!repoExists) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Validate required fields
    if (!taskData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (taskData.labels) {
  const validLabels = ['Authentication', 'Security', 'Backend', 'Frontend', 'Bug', 'Feature', 'Improvement'];
  const invalidLabels = taskData.labels.filter(label => !validLabels.includes(label));
  if (invalidLabels.length > 0) {
    return res.status(400).json({ error: `Invalid labels: ${invalidLabels.join(', ')}` });
  }
}

if (!taskData.priority || !['low','medium','high'].includes(taskData.priority)) {
  return res.status(400).json({ error: 'Valid priority is required' });
}

    // Create task with status validation
    const newTask = new Task({
      ...taskData,
      repository: repoId,
      status: 'todo', // Default status
      createdBy: req.user._id
    });

    const session = await mongoose.startSession();
    try {
    session.startTransaction();

    const savedTask = await newTask.save({ session });

    try {
await Board.findOneAndUpdate(
  { repository: repoId },
  [{
    $set: {
      columns: {
        $cond: [
          { $eq: [{ $type: "$columns" }, "missing"] },
          { // New board
            backlog: [],
            todo: [savedTask._id],
            'in-progress': [],
            review: [],
            done: []
          },
          { // Existing board
            $mergeObjects: [
              "$columns",
              { 
                todo: {
                  $concatArrays: [
                    [savedTask._id], 
                    "$columns.todo"
                  ]
                }
              }
            ]
          }
        ]
      }
    }
  }],
  { upsert: true, session }
);

} catch (boardError) {
  console.error('Board update failed:', boardError);
  return;
}
    const populatedTask = await Task.findById(savedTask._id)
      .populate('assignees', 'username email')
      .populate('createdBy', 'username').lean();

    if (!populatedTask.status) populatedTask.status = 'todo';


    // Add error handling for socket emission
    if (req.io) {
      req.io.to(`repo-${repoId}`).emit('taskUpdate', {
        action: 'create',
       task: {
      ...populatedTask,
      status: populatedTask.status || 'todo' // Ensure status exists
    },
        column: 'todo'
      });
    }

    res.status(201).json(populatedTask);
    await session.commitTransaction();

    } catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
  } catch (error) {
    console.error('Task creation error:', error);
    // Prevent multiple response sends
  if (!res.headersSent) {
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      error: 'Task creation failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        updateOperation: error.errorResponse 
      } : undefined
    });
   }
  }
};

exports.mirrorTaskToGitea = async (req, res) => {
  try {
    const { repoId, taskId } = req.params;
    const repo = await Repository.findById(repoId)
      .populate('owner')
      .populate('collaborators');

    const giteaService = new GiteaService({
      url: process.env.GITEA_URL,
      token: repo.owner?.giteaToken,
    });

    const gitRepo = await ensureLocalRepoInstance(repoId); // from your existing code

    // Mirror task to Gitea
    const giteaIssue = {
      title: req.body.title,
      labels: [GITEA_LABEL_TASK],
      description: req.body.description,
    };

    const issueId = await giteaService.createIssue(repo.name, giteaIssue);

    // Update the task with the Gitea issue ID
    await Task.findByIdAndUpdate(taskId, {
      giteaIssueId: issueId,
    });

    res.status(200).json({ message: 'Task mirrored to Gitea issue successfully' });
  } catch (error) {
     res.status(500).json({ error: error.message }); 
  }
};

exports.deleteTask= async (req, res) => {
  try {
    const { taskId } = req.params;
    await Task.findByIdAndDelete(taskId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.findAndUpdateTask= async (req, res) => {
   try {
    const { taskId } = req.params;
    const { status, repositoryId } = req.body;
     const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done'];
     const allowedTransitions = {
  'backlog': ['todo'],
  'todo': ['in-progress', 'backlog'],
  'in-progress': ['review', 'todo'],
  'review': ['done', 'in-progress'],
  'done': ['review']
};


      if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (!repositoryId) {
      return res.status(400).json({ error: 'Missing repository ID' });
    }


     const currentTask = await Task.findById(taskId);
    if (!currentTask) return res.status(404).json({ error: 'Task not found' });
    if (!validStatuses.includes(currentTask.status)) {
      return res.status(400).json({ error: 'Existing task status invalid' });
    }

     const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true, runValidators: true }
    ).populate('repository assignees');


 await Board.findOneAndUpdate(
      { repository: repositoryId },
      {
        $pull: { [`columns.${currentTask.status}`]: taskId },
        $addToSet: { [`columns.${status}`]: taskId }
      },
      { new: true }
    );

    // Emit socket event
    req.io.to(`repo-${repositoryId}`).emit('taskUpdate', {
      action: 'move',
      task: updatedTask,
      from: currentTask.status,
      to: status // Guaranteed valid
    });

    if (!allowedTransitions[currentTask.status].includes(status)) {
  return res.status(400).json({ error: 'Invalid status transition' });
}

    res.json({
      task: updatedTask,
      from: currentTask.status,
      to: status
    });


  } catch (err) {
     console.error('Status update error:', err);
    res.status(500).json({ 
      error: 'Status update failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

exports.getUserTasks = async (req, res) => {
   try {
     const { userId } = req.params;
    // Basic validation - check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const tasks = await Task.find({ assignees: userId })
      .populate({
        path: 'repository',
        select: 'name _id',
        match: { deleted: { $ne: true } // Exclude deleted repositories
      }})
      .populate({
        path: 'assignees',
        select: 'username',
        options: { limit: 3 }
      })
      .sort({ dueDate: 1 });

    // Filter out tasks from deleted repositories
    const filteredTasks = tasks.filter(task => task.repository !== null);
    
    res.json(filteredTasks);
  } catch (err) {
    console.error('User tasks error:', err);
    res.status(500).json({ 
      error: 'Failed to load user tasks',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
}
