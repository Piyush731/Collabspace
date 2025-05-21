// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Core Properties
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 120 
  },
  description: {
    type: String,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
    default: 'todo',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Gitea Integration
  giteaIssueId: {
    type: Number,
    unique: true,
    sparse: true // For tasks not linked to Gitea issues
  },
  giteaSync: {
    type: Boolean,
    default: false
  },

  // Repository Relationship
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },

  // Team Collaboration
 assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Workflow Tracking
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  estimatedTime: Number, // In hours

  // Content Management
  labels: [{
    type: String,
    enum: ['Authentication', 'Security', 'Backend', 'Frontend', 'Bug', 'Feature', 'Improvement']
  }],
  attachments: [{
    name: String,
    giteaFileUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Activity Tracking
  activityLog: [{
    actionType: { 
      type: String, 
      enum: ['create', 'status', 'priority', 'assignment', 'comment', 'attachment'] 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],

  // Discussion System
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 1000 },
    giteaCommentId: Number,
    reactions: [{
      emoji: String,
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
   validateBeforeSave: true 
});

taskSchema.path('assignees').validate({
  validator: async function(assignees) {
    const repo = await mongoose.model('Repository').findById(this.repository)
      .select('collaborators owner');
    
    // Allow owner even if not in collaborators
    const validUsers = [
      ...repo.collaborators.map(c => c.user), 
      repo.owner
    ];
    
    return assignees.every(userId => 
      validUsers.some(u => u.equals(userId))
    );
  },
  message: 'Assignees must be repository owner or collaborators'
});

// Indexes for common queries
taskSchema.index({ assignees: 1, status: 1 });
taskSchema.index({ repository: 1, status: 1 });
taskSchema.index({ dueDate: 1 });


taskSchema.virtual('previousStatus').get(function() {
  return this._previousStatus;
});

// With this working version:
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this._previousStatus = this._originalStatus;
  }
  next();
});

taskSchema.pre('save', function(next) {
  this._originalStatus = this.status;
  next();
});

module.exports = mongoose.model('Task', taskSchema);