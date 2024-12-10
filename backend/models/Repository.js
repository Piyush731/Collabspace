const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  files: [{ name: String, content: String }], // Simplified file representation
});

module.exports = mongoose.model("Repository", RepositorySchema);
