// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    type: String,
    enum: ['Authentication', 'Security', 'Backend', 'Frontend', 'Bug', 'Feature']
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true  },
    text: { type: String, required: true },
    createdAt: { type: Date,  default: Date.now }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now  }
  }],
  activityLog: [{
    type: { type: String, enum: ['create', 'update', 'comment', 'status-change']     },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    details: String, timestamp: { type: Date, default: Date.now } 
  }] }, 
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

  module.exports = mongoose.model('Task', taskSchema);