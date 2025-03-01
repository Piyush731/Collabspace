const Invite = require('../models/PendingInvite');
const Repository = require('../models/Repository');
const User = require('../models/User');
const axios = require('axios');

module.exports.addCollaborator = async (req, res) => {
  try {
    const { repoId, username, permission } = req.body;
    if (!repoId || !username || !permission) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: "Repository not found" }); 
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const owner = await User.findById(repo.owner);

    // Gitea API call
    await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/collaborators/${username}`,
      { permission },
      {
        headers: {
          Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    ); 
    // MongoDB update
    await Repository.findByIdAndUpdate(
      repoId,
      { $addToSet: { collaborators: { user: user._id, permission } } }
    );

    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error.response?.data || error.message);
  res.status(500).json({ error: 'Failed to add collaborator: ' + error.message });
  }
};