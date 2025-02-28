const jiraIssueSchema = new mongoose.Schema({
    key:      { type: String, required: true }, // JIRA issue key (e.g., "PROJ-123")
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
    summary:  { type: String, required: true },
    description: String,
    status:   { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['lowest', 'low', 'medium', 'high', 'highest'] },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gitBranch: String,
    relatedCommits: [String], // Array of commit SHAs
    jiraData: { type: mongoose.Schema.Types.Mixed }, // Raw JIRA API response
    lastSynced: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  });
  
  jiraIssueSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
  
  module.exports = mongoose.model('JiraIssue', jiraIssueSchema);