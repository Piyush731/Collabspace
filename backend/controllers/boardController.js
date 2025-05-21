// backend/controllers/boardController.js
const Board = require('../models/Board');
const Task = require('../models/Task'); // Import Task model
const Repository = require('../models/Repository');
const mongoose = require('mongoose');

exports.getBoard = async (req, res) => {
  try {
    const repoId = req.params.repoId;
     if (!repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ error: 'Invalid repository ID' });
    }

    // Verify repository exists first
    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found from boards' });
    }

    let board = await Board.findOne({ repository: repoId })
      .populate({
        path: 'columns.backlog columns.todo columns.in-progress columns.review columns.done',
        select: '_id title description priority dueDate assignees labels',
        populate: [{
          path: 'assignees',
          select: '_id username email'
        }, {
          path: 'repository',
          select: 'name'
        }]
      });

    if (!board) {
      // Create board with properly initialized columns
      board = await Board.create({ 
        repository: repoId,
        columns: {
          backlog: [],
          todo: [],
          'in-progress': [],
          review: [],
          done: []
        }
      });

      // Find existing tasks and update columns
      const tasks = await Task.find({ repository: repoId });
      
      const update = {};

      const columns = ['backlog', 'todo', 'in-progress', 'review', 'done'];
      columns.forEach(col => update[`columns.${col}`] = []);

      tasks.forEach(task => {
        const status = columns.includes(task.status) ? task.status : 'backlog';
        update[`columns.${status}`].push(task._id);
      });

      await Board.findByIdAndUpdate(board._id, update);
      // Re-fetch with proper population
      board = await Board.findById(board._id).populate({
        path: 'columns.backlog columns.todo columns.in-progress columns.review columns.done',
        select: '_id title description',
        populate: {
          path: 'assignees',
          select: 'username'
        }
      });
    }
    res.status(200).json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ 
      message: 'Error fetching board',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Add to boardController.js
exports.createBoard = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    let board = await Board.findOne({ repository: repoId });

    if (!board) {
      board = await Board.create({ repository: repoId });
      // Initialize with existing tasks
      const tasks = await Task.find({ repository: repoId });
      const columns = tasks.reduce((acc, task) => {
        acc[task.status].push(task._id);
        return acc;
      }, { backlog: [], todo: [], 'in-progress': [], review: [], done: [] });
      
      board.columns = columns;
      await board.save();
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateColumns = async (req, res) => {
  if (!req.body.columns || !req.body.activityLog) {
      return res.status(400).json({ error: 'Invalid update data' });
    }
     const moves = req.body.activityLog;
    const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done'];
    for (const move of moves) {
      if (!validStatuses.includes(move.to) || !validStatuses.includes(move.from)) {
        return res.status(400).json({ error: 'Invalid status transition' });
      }
    }
  try {
    const board = await Board.findOneAndUpdate(
      { repository: req.params.repoId },
      { columns: req.body.columns },
      { new: true }
    ).populate('columns.$*');

    // Log activity for all task moves
    const moves = req.body.activityLog;
    await Task.bulkWrite(moves.map(move => ({
      updateOne: {
        filter: { _id: move.taskId },
        update: {
          $push: {
            activityLog: {
              actionType: 'status-change',
              user: req.user.id,
              oldValue: move.from,
              newValue: move.to
            }
          }
        }
      }
    })));

    req.io.to(`repo-${req.params.repoId}`).emit('board-updated', board);
    res.json(board);
  } catch (err) {
     console.error('Column update error:', {
      message: err.message,
      activityLog: req.body.activityLog,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};


const fetchGiteaIssues = async (repoId) => {
   const repo = await Repository.findById(repoId);
  const response = await axios.get(
    `${process.env.GITEA_URL}/repos/${repo.owner.username}/${repo.name}/issues`,
    { headers: { Authorization: `token ${repo.owner.giteaToken}` } }
  );
  return response.data;
};

const mapGiteaState = (state) => {
  const stateMap = {
    'open': 'todo',
    'closed': 'done',
    'progress': 'in-progress',
    'review': 'review'
  };
  return stateMap[state] || 'backlog';
};
exports.syncWithGitea = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    const giteaIssues = await fetchGiteaIssues(repo.giteaRepoId);
    
    const bulkOps = giteaIssues.map(issue => ({
      updateOne: {
        filter: { giteaIssueId: issue.id },
        update: {
          $set: {
            title: issue.title,
            description: issue.description,
            status: mapGiteaState(issue.state),
            giteaSync: true
          },
          $setOnInsert: {
            repository: req.params.repoId,
            createdBy: repo.owner
          }
        },
        upsert: true
      }
    }));

    await Task.bulkWrite(bulkOps);
    await Board.updateLastSync(req.params.repoId);
    
    res.json({ message: `${giteaIssues.length} issues synced` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};