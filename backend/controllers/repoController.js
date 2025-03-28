const Repository = require('../models/Repository');
const User = require('../models/User');
const axios = require('axios'); 
const mongoose = require('mongoose');


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
          Authorization: `token ${owner.giteaToken}`,
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
   const [branches, commits, repoDetails, issues, prs, readme, collaborators] = await Promise.all([
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/branches`,{
      headers: { Authorization: `token ${owner.giteaToken}` } // Add this to all calls
    }).catch(() => ({ data: [] })), 
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/commits`,{
      headers: { Authorization: `token ${owner.giteaToken}` } // Add this to all calls
    }).catch(() => ({ data: [] })), 
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}`,{
      headers: { Authorization: `token ${owner.giteaToken}` } // Add this to all calls
    }) .catch(() => ({ data: {} })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/issues?state=all`,{
      headers: { Authorization: `token ${owner.giteaToken}` } // Add this to all calls
    }).catch(() => ({ data: [] })),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/pulls?state=all`,{
      headers: { Authorization: `token ${owner.giteaToken}` } // Add this to all calls
    }).catch(() => ({ data: [] })), 
    axios.get( `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repoName)
      }/contents/README.md?ref=${
        encodeURIComponent(repo.defaultBranch)
      }`,
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    ).then((response) => { 
      return response;
    }).catch((error) => { 
      return { data: null }; // Ensure readme is always defined
    }),
    axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repoName}/collaborators`, {
      headers: { Authorization: `token ${owner.giteaToken}` }
    }).catch(() => ({ data: [] })), 
    
  ]);

  // Map Gitea collaborators to include MongoDB user references
const usernames = collaborators.data.map(c => c.username);
const users = await User.find({ username: { $in: usernames } });
const mappedCollaborators = collaborators.data.map(c => {
  const user = users.find(u => u.username === c.username);
  return {
    user: user ? { _id: user._id, username: user.username } : null,
    permission: c.permission
  };
});

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
      collaborators: mappedCollaborators,
      readme: readme && readme.data ? {
        content: Buffer.from(readme.data.content, 'base64').toString(),
        sha: readme.data.sha,
        path: readme.data.path,
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
  const userId = new mongoose.Types.ObjectId(req.user._id);
    try {
      const repositories = await Repository.find({
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      })
      .populate('owner', 'username email')
      .populate('collaborators.user', '_id username email');
  
      res.json(repositories);
  
    } catch (error) {
      console.error('Fetch user repositories error:', error);
      res.status(500).json({ error: 'Failed to fetch user repositories' });
    }
  }; 


  
//get  contents of repo
exports.getRepoContents = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const path = req.query.path || '';
    const branch = req.query.ref || 'main';
    if (!repoId) {
      return res.status(400).json({ error: "Repository ID is required" });
    }
    const repo = await Repository.findById(repoId); 
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    } 
    const owner = await User.findById(repo.owner); 
    if (!owner) {  
      return res.status(404).json({ error: 'Repository owner not found' });
    }
    if (!owner.giteaToken) {
      return res.status(403).json({ error: "Gitea token is required for repository access" });
    }
    // Proper URL encoding and Gitea API structure
    const encodedPath = path === '' ? '' : encodeURIComponent(path);
    const url = `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${encodedPath}?ref=${branch}`;
    console.log("🔗 Fetching Gitea contents from:", url);
    const response = await axios.get(url, {
      headers: { Authorization: `token ${owner.giteaToken}` }
    });

    const contents = response.data.map(item => ({
      name: item.name,
      path: path ? `${path}/${item.name}` : item.name,
      type: item.type,
      size: item.size,
      sha: item.sha,
      html_url: item.html_url,
      parentPath: path
    }));

    res.json(contents);
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({ error: 'Failed to fetch repository contents' });
  }
};

exports.getRecursiveContents = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    const owner = await User.findById(repo.owner);
    const branch = req.query.ref || repo.defaultBranch;

    const fetchContents = async (path) => {
      const response = await axios.get(
        `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${encodeURIComponent(path)}?ref=${branch}`,
        { headers: { Authorization: `token ${owner.giteaToken}` } }
      );
      
      return Promise.all(response.data.map(async item => {
        if (item.type === 'dir') {
          item.contents = await fetchContents(item.path);
        }
        return item;
      }));
    };

    const tree = await fetchContents('');
    res.json(tree);
  } catch (error) {
    console.error('Error fetching recursive contents:', error);
    res.status(500).json({ error: 'Failed to fetch recursive contents' });
  }
};


 // Add to existing exports
 exports.createFile = async (req, res) => {
  let cleanPath;
  let latestCommitSHA;
  try {
    const repoId = req.params.repoId;
    const { path: rawPath, content, branch = 'main', new_branch } = req.body;

    // Validation
    if (!rawPath || content === undefined) {
      return res.status(400).json({ error: "Path and content are required" });
    }

    // Normalize and encode path
    cleanPath = rawPath
      .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
      .split('/')
      .filter(segment => segment.trim() !== '')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);
    
    // Get initial branch SHA
    let targetBranch = branch;
    try {
      const branchInfo = await axios.get(
        `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/branches/${targetBranch}`,
        { headers: { Authorization: `token ${owner.giteaToken}` }}
      );
      latestCommitSHA = branchInfo.data.commit.id;
    } catch (branchError) {
      if (new_branch) {
        const defaultBranch = repo.defaultBranch || 'main';
        const defaultBranchInfo = await axios.get(
          `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/branches/${defaultBranch}`,
          { headers: { Authorization: `token ${owner.giteaToken}` }}
        );
        latestCommitSHA = defaultBranchInfo.data.commit.id;
        targetBranch = new_branch;
      } else {
        throw new Error(`Branch ${targetBranch} not found`);
      }
    }

    // Create parent directories recursively
    const pathSegments = cleanPath.split('/').slice(0, -1);
    let currentPath = '';
    
    for (const segment of pathSegments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      
      try {
        // Check if directory exists
        await axios.get(
          `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/contents/${currentPath}?ref=${targetBranch}`,
          { headers: { Authorization: `token ${owner.giteaToken}` }}
        );
      } catch (dirError) {
        if (dirError.response?.status === 404) {
          // Create directory with .gitkeep
          const dirResponse = await axios.post(
            `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/contents/${currentPath}/.gitkeep`,
            {
              content: content,
              message: `Create directory ${currentPath}`,
              branch: targetBranch,
              sha: latestCommitSHA
            },
            { headers: { Authorization: `token ${owner.giteaToken}` }}
          );
          latestCommitSHA = dirResponse.data.commit.id;
        } else {
          throw dirError;
        }
      }
    }

    // Create final file
    const fileResponse = await axios.post(
      `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/contents/${cleanPath}`,
      {
        content: Buffer.from(content, "utf-8").toString("base64"),
        message: `Create ${cleanPath}`,
        branch: targetBranch,
        sha: latestCommitSHA
      },
      {
        headers: {
          Authorization: `token ${owner.giteaToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(fileResponse.data);
  } catch (error) {
    console.error('File creation error:', error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: 'File operation failed',
      details: error.response?.data?.message || error.message
    });
  }
};
// Add to repoController.js
exports.updateFile = async (req, res) => {
  let cleanPath;
  try {
    const repoId = req.params.repoId;
    const { path: rawPath, content, branch = 'main', message, sha } = req.body;

    if (!rawPath || !content || !sha) {
      return res.status(400).json({ error: "Path, content, and SHA are required" });
    }

    // Path sanitization
    cleanPath = rawPath
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);
    
    const encodedOwner = encodeURIComponent(owner.username);
    const encodedRepo = encodeURIComponent(repo.name);

    const requestData = {
      content: req.body.content,
      message: message || `Update ${rawPath}`,
      branch: branch,
      sha: sha // SHA of the file being updated
    };

    const response = await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${encodedOwner}/${encodedRepo}/contents/${cleanPath}`,
      requestData,
      {
        headers: {
          Authorization: `token ${owner.giteaToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Update Error:', {
      path: cleanPath,
      branch: req.body?.branch,
      shaUsed: req.body?.sha,
      giteaError: error.response?.data
    });
    
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: 'File update failed',
      details: error.response?.data?.message || error.message
    });
  }
};

exports.downloadRepoZip = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const branch = req.query.branch || 'main';

    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);

    const giteaUrl = `${process.env.GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/archive/${branch}.zip`;

    const response = await axios({
      method: 'get',
      url: giteaUrl,
      responseType: 'stream',
      headers: {
        Authorization: `token ${owner.giteaToken}`
      }
    });

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${repo.name}-${branch}.zip`
    });

    response.data.pipe(res);

  } catch (error) {
    console.error('Zip download error:', error);
    res.status(500).json({
      error: 'Failed to generate repository zip',
      details: error.message
    });
  }
};

exports.createDirectory = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const { path, branch = 'main', message = `Create directory ${path}` } = req.body;

    // Validate inputs
    if (!repoId) return res.status(400).json({ error: "Repository ID required" });
    if (!path) return res.status(400).json({ error: 'Path is required' });

    const repo = await Repository.findById(repoId);
    const owner = await User.findById(repo.owner);
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    // Encode path segments separately to preserve slashes
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const dummyFilePath = `${encodedPath}/.gitkeep`;

    // Get current branch SHA
    const branchInfo = await axios.get(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/branches/${branch}`,
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    const latestCommitSHA = branchInfo.data.commit.id;

    // Create directory by adding .gitkeep file
    const response = await axios.post(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${dummyFilePath}`,
      {
        content: Buffer.from("").toString("base64"), // Empty content
        message,
        branch,
        sha: latestCommitSHA
      },
      {
        headers: {
          Authorization: `token ${owner.giteaToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Directory creation error:', error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      error: 'Directory creation failed',
      details: error.response?.data?.message || error.message
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    if (!repoId) {
      console.error("❌ Missing repoId in request");
      return res.status(400).json({ error: "Repository ID is required to delete file" });
    }

    const { path, branch = 'main' } = req.body;
    if (!path) {
      console.error("❌ Missing file path in request");
      return res.status(400).json({ error: "File path is required to delete" });
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      console.error("❌ Repository not found");
      return res.status(404).json({ error: 'Repository not found' });
    }

    const owner = await User.findById(repo.owner);
    if (!owner) {
      console.error("❌ Repository owner not found");
      return res.status(404).json({ error: 'Repository owner not found' });
    }

    // Get file SHA before deletion
    const fileUrl = `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}?ref=${branch}`;
    let sha;
    try {
      const fileResponse = await axios.get(fileUrl, {
        headers: { Authorization: `token ${owner.giteaToken}` },
      });
      sha = fileResponse.data.sha;
    } catch (error) {
      if (error.response?.status === 404) {
        console.error("❌ File not found, cannot delete:", path);
        return res.status(404).json({ error: "File not found" });
      }
      console.error("❌ Error retrieving file SHA:", error.response?.data || error.message);
      return res.status(500).json({ error: "Error retrieving file details" });
    }

    // Send DELETE request to Gitea API
    const deleteUrl = `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}`;
    const response = await axios.delete(deleteUrl, {
      headers: {
        Authorization: `token ${owner.giteaToken}`,
        "Content-Type": "application/json",
      },
      data: {
        message: `Delete ${path}`,
        sha,
        branch,
      },
    });

    res.json({ success: true, message: "File deleted successfully", data: response.data });
  } catch (error) {
    console.error("❌ File deletion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to delete file" });
  }
}; 

exports.syncCollaborators = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    const owner = await User.findById(repo.owner);
    
    const response = await axios.get(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/collaborators`,
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );

    const collaborators = await Promise.all(response.data.map(async c => {
      const user = await User.findOne({ username: c.username });
      return { 
        user: user ? user._id : null, // Store ObjectId
        permission: c.permission 
      };
    }));

    repo.collaborators = collaborators.filter(c => c.user !== null);
    await repo.save();
    res.json(collaborators);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const { username, permission } = req.body;
    const repoId = req.params.repoId;
    
    // Validate inputs
    if (!username || !permission) {
      return res.status(400).json({ error: "Username and permission are required" });
    }

    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: "Repository not found" });

    const owner = await User.findById(repo.owner);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    // Verify user exists in Gitea
    try {
      await axios.get(`${process.env.GITEA_URL}/api/v1/users/${username}`, {
        headers: { Authorization: `token ${owner.giteaToken}` }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: "User does not exist in Gitea" });
      }
      throw error;
    }

    // Add collaborator to Gitea
    await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/collaborators/${username}`,
      { permission },
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    
    // Fetch updated collaborator list from Gitea
    const giteaResponse = await axios.get(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/collaborators`,
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    
    // Map Gitea collaborators to our user IDs
    const usernames = giteaResponse.data.map(c => c.username);
    const users = await User.find({ username: { $in: usernames } });
    
    const mappedCollaborators = collaborators.data.map(c => ({
      user: users.find(u => u.username === c.username)?._id,
      permission,
    })).filter(c => c.user);  // Filter out collaborators without local users
    
    // Update repository with synced collaborators
    repo.collaborators = mappedCollaborators;
    await repo.save(); 
    res.json(mappedCollaborators);

  } catch (error) {
    console.error('Add collaborator error:', error.response?.data || error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to add collaborator';
    res.status(status).json({ error: message });
  }
};