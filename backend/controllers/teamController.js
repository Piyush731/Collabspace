const Invite = require('../models/PendingInvite');
const Repository = require('../models/Repository');
const User = require('../models/User');
const axios = require('axios');

exports.addCollaborator = async (req, res) => {
  try {
    const { repoId, username, permission } = req.body;
    const repo = await Repository.findById(repoId);
    const user = await User.findOne({ username });
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
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
};