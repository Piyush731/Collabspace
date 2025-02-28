const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  path: { type: String, required: true },  //repo path
  name: { type: String, required: true }, content: String,
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  latestCommit: { type: String, required: true },
  versions: [{ commitHash: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: Date, message: String }],
  history: [{  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: { type: Date, default: Date.now }, changes: String }],
  jiraIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JiraIssue' }]
});

module.exports = mongoose.model('File', fileSchema);