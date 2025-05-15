// backend/controllers/boardController.js
const Board = require('../models/Board');
const Task = require('../models/Task'); // Import Task model
const Repository = require('../models/Repository');

exports.getBoard = async (req, res) => {
  try {
    const repoId = req.params.repoId;

    let board = await Board.findOne({ repository: repoId })
      .populate({
        path: 'columns.backlog columns.todo columns.in-progress columns.review columns.done',
        select: '_id title description priority dueDate assignees labels',
        populate: {
          path: 'assignees',
          select: '_id username email'
        }
      });

    if (!board) {
      // Create board with empty columns
      board = await Board.create({ repository: repoId });
      
      // Find existing tasks for this repo and add to appropriate columns
      const tasks = await Task.find({ repository: repoId });
      
      const columns = tasks.reduce((acc, task) => {
        acc[task.status].push(task._id);
        return acc;
      }, {
        backlog: [],
        todo: [],
        'in-progress': [],
        review: [],
        done: []
      });

      board.columns = columns;
      await board.save();
      await board.populate('columns.backlog columns.todo columns.in-progress columns.review columns.done');
    }

    res.status(200).json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Error fetching board', error: error.message });
  }
};

exports.updateColumns = async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
};


const fetchGiteaIssues = async (repoId) => {
  // Implement actual Gitea API call
  return []; // Replace with real implementation
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