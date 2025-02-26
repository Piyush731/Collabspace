const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: String,
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  version: { type: Number, default: 0 },
  history: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    changes: String
  }]
});

module.exports = mongoose.model('File', fileSchema);