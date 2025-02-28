const Repository = require('../models/Repository');
const User = require('../models/User');
const axios = require('axios');

exports.createRepository = async (req, res) => {
    let giteaResponse = null;
  try {
    const { name, description, visibility } = req.body;
    const owner = await User.findById(req.user._id);
    if (!name || !description || !visibility) {
        return res.status(400).json({ error: 'Name, description, and visibility are required' });
      }
      const existingRepo = await Repository.findOne({ name, owner: owner._id });
      if (existingRepo) {
        return res.status(400).json({ error: 'Repository name already exists' });
      }
    // Create in Gitea
          giteaResponse = await axios.post(
      `${process.env.GITEA_URL}/api/v1/user/repos`,
      {
        name,
        description,
        private: visibility === 'private',
        auto_init: true
      },
      {
        headers: {
          Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    ); 
    // save in MongoDB
    const repository = new Repository({
      name,
      description,
      visibility,
      owner: owner._id,
      collaborators: [{
        user: owner._id,
        permission: 'admin'
      }],
      giteaRepoId: giteaResponse.data.id,
      cloneUrl: giteaResponse.data.clone_url,
      defaultBranch: giteaResponse.data.default_branch
    }); 
    await repository.save();
    //combined dta of both
    res.status(201).json({
      ...repository.toObject(),
      gitData: giteaResponse.data
    });

  } catch (error) {
    console.error('Repository creation error:', error);
    // Cleanup of ghost Gitea repo
    if (giteaResponse?.data?.id) {
        await axios.delete(
          `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${req.body.name}`,
          { headers: { Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}` } }
        );
      }
    res.status(500).json({ error: 'Repository creation failed' });
  }
};

exports.getRepository = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email');
      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      } 
       const owner = await User.findById(repo.owner); 
    // Get Gitea data
    const [branches, commits] = await Promise.all([
      axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/branches`),
      axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/commits`)
    ]);
   //combined data returned
    res.json({
      metadata: repo.toObject(),
      gitData: {
        branches: branches.data,
        commits: commits.data
      }
    });
  } catch (error) {
    console.error('Fetch repository error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repository data' });
  }
};

// Fetch User Repositories
exports.getUserRepositories = async (req, res) => {
    try {
      const repositories = await Repository.find({
        $or: [
          { owner: req.user.id },
          { 'collaborators.user': req.user.id }
        ]
      })
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email');
  
      res.json(repositories);
  
    } catch (error) {
      console.error('Fetch user repositories error:', error);
      res.status(500).json({ error: 'Failed to fetch user repositories' });
    }
  };