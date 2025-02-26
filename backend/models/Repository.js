const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
  type: { type: String, enum: ['private', 'shared'], default: 'private',required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
repositorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
repositorySchema.index({ name: 1, owner: 1 }, { unique: true });
module.exports = mongoose.model('Repository', repositorySchema);