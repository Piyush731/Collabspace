const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 }, 
  description: {type: String, default: '' }, // Added for better metadata
  visibility: { type: String, enum: ['private', 'public'], default: 'private', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }, permission: { // Mirror Gitea's collaborator permissions
    type: String,
    enum: ['read', 'write', 'admin'],
    default: 'read'
  }, 
    default: []
}],
  defaultBranch: { type: String, default: 'main'},
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }], 
  giteaRepoId: { type: Number, required: true }, // Gitea's repository ID
  cloneUrl: { type: String, required: true },    // Gitea clone URL
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  jiraConfig: { projectId: { type: String },  projectKey: { type: String }, apiUrl: { type: String },authToken: { type: String, select: false }, enabled: { type: Boolean, default: false } },
  jiraMappings: {
    issueTypes: [{ jiraId: String, name: String, default: Boolean }],
    priorities: [{ jiraId: String, name: String }] } 
  });
repositorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
repositorySchema.index({ name: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);