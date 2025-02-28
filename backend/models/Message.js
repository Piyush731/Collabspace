const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message'}, //message threading
  giteaIssueId: Number,                                  // Link to Gitea issues if needed
  attachments: [{ url: String, name: String }], 
  createdAt: { type: Date, default: Date.now },
  jiraCommentId: { type: String }, // ID of linked JIRA comment
  jiraIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'JiraIssue' }, 
  jiraSync: { synced: Boolean, lastAttempt: Date }
});

module.exports = mongoose.model('Message', messageSchema);