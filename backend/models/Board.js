const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    unique: true
  },
  
  // Column Structure
  columns: {
    backlog: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      validate: [arrayLimit, '{PATH} exceeds 100 task limit'],
      index: true
    }],
    todo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      validate: [arrayLimit, '{PATH} exceeds 100 task limit']
    }],
    'in-progress': [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      validate: [arrayLimit, '{PATH} exceeds 100 task limit']
    }],
    review: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      validate: [arrayLimit, '{PATH} exceeds 100 task limit']
    }],
    done: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      validate: [arrayLimit, '{PATH} exceeds 100 task limit']
    }]
  },

  // Board Configuration
  workflowRules: {
    autoArchiveDone: {
      type: Boolean,
      default: false
    },
    restrictStatusChanges: {
      type: Boolean,
      default: false
    }
  },

  // Gitea Sync Tracking
  lastGiteaSync: Date,
  syncError: String
});

// Helper validation
function arrayLimit(val) {
  return val.length <= 100;
}

// Index for fast column operations
boardSchema.index({ 'repository': 1 });

boardSchema.statics.updateLastSync = async function(repoId) {
  await this.updateOne(
    { repository: repoId },
    { lastGiteaSync: Date.now(), syncError: null }
  );
};

module.exports = mongoose.model('Board', boardSchema);