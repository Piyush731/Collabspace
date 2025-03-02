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
        const repoName = repo.name;
    // Get Gitea data
   // Fetch all Gitea data in parallel
   const [branches, commits, repoDetails, issues, prs, readme] = await Promise.all([
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/branches`)
      .catch(() => ({ data: [] })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/commits`)
      .catch(() => ({ data: [] })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}`)
      .catch(() => ({ data: {} })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/issues?state=all`)
      .catch(() => ({ data: [] })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/pulls?state=all`)
      .catch(() => ({ data: [] })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/readme`)
      .catch(() => ({ data: null }))
  ]);
   //combined data returned
   res.json({
    metadata: repo.toObject(),
    gitData: {
      branches: branches.data,
      commits: commits.data,
      stats: {
        stars: repoDetails.data.stars_count,
        forks: repoDetails.data.forks_count,
        issues: repoDetails.data.open_issues_count
      },
      issues: issues.data,
      prs: prs.data,
      readme: readme.data ? {
        content: Buffer.from(readme.data.content, 'base64').toString(),
        encoding: readme.data.encoding
      } : null
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
          { owner: req.user._id },
          { 'collaborators.user': req.user._id }
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


  // Add to existing exports
exports.createFile = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { path, content, branch = 'main' } = req.body;
    
    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);
    
    const response = await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}`,
      {
        content: Buffer.from(content).toString('base64'),
        branch,
        message: `Create ${path}`
      },
      {
        headers: {
          Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('File creation error:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
};

exports.createDirectory = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { path, branch = 'main' } = req.body;
    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);

    // Create .gitkeep file to establish directory
    const response = await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}/.gitkeep`,
      {
        content: Buffer.from('').toString('base64'),
        branch,
        message: `Create directory ${path}`
      },
      {
        headers: {
          Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Directory creation error:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
};

exports.getRepoContents = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    const owner = await User.findById(repo.owner);
    const path = req.query.path || '';
    const branch = req.query.ref || repo.defaultBranch;

    // Proper URL encoding and Gitea API structure
    const encodedPath = encodeURIComponent(path);
    const url = `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${encodedPath}?ref=${branch}`;

    const response = await axios.get(url, {
      headers: { Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({ error: 'Failed to fetch repository contents' });
  }
};