const mongoose = require('mongoose');

const pendingInviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  jiraPermissions: { type: String, enum: ['browse', 'read', 'write', 'admin'], default: 'read' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 7*24*60*60*1000 } //7 days
});

module.exports = mongoose.model('PendingInvite', pendingInviteSchema);