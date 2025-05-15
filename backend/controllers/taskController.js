// backend/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const Repository = require('../models/Repository');

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
    const tasks = await Task.find({ repoId: req.params.repoId })
      .populate('assignee')
      .populate('author');

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

    const newTask = new Task({
      ...taskData,
      repository: repoId,
      status: 'todo',
      createdBy: req.user._id
    });

    const savedTask = await newTask.save();

    // Update board
    await Board.findOneAndUpdate(
      { repository: repoId },
      { $push: { 'columns.todo': savedTask._id } }
    );

    const populatedTask = await Task.findById(savedTask._id)
      .populate('assignees', 'username email')
      .populate('createdBy', 'username');

    req.io.to(`repo-${repoId}`).emit('taskUpdate', {
      action: 'create',
      task: populatedTask,
      column: 'todo'
    });

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Task creation failed' });
  }
};

exports.mirrorTaskToGitea = async (req, res) => {
  try {
    const { repoId } = req.params;
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
     res.status(500).json({ error: err.message });
    // ... error handling and response ...
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
