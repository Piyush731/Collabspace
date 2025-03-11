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
   const [branches, commits, repoDetails, issues, prs, readme] = await Promise.all([
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
      console.log('README Response:', response.data);
      return response;
    }).catch((error) => {
      console.error('README Fetch Error:', error.response?.data || error.message);
      return { data: null }; // Ensure readme is always defined
    })
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


  
//get  contents of repo
exports.getRepoContents = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const path = req.query.path || '';
    const branch = req.query.ref || 'main';
    console.log("Fetching repo contents for repoId:", repoId);
    if (!repoId) {
      console.error("❌ Missing repoId in request");
      return res.status(400).json({ error: "Repository ID is required" });
    }
    const repo = await Repository.findById(repoId); 
    if (!repo) {
      console.error("❌ Missing repo in monoodb request");
      return res.status(404).json({ error: 'Repository not found' });
    } 
    console.log("✅ Found repository:", repo.name);
    const owner = await User.findById(repo.owner); 
    if (!owner) {  
      console.error(`❌ Owner not found for repository: ${repo.name}`);
      return res.status(404).json({ error: 'Repository owner not found' });
    }
    console.log("✅ Found owner:", owner.username);

    if (!owner.giteaToken) {
      console.error(`❌ Missing Gitea token for owner: ${owner.username}`);
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
  try {
    const repoId = req.params.repoId;
    if (!repoId) {
      console.error("Missing repoId in request of create file");
      return res.status(400).json({ error: "Repository ID is required to create file" });
    }
    const { path, content, branch = 'main' } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found in CreateFile' });
    } 
    const owner = await User.findById(repo.owner);
    if (!owner) {
      return res.status(404).json({ error: 'Repository owner not found' });
    }

    const fileUrl = `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}?ref=${branch}`; 
    let sha = null;
    let isExistingFile = false;
    try {  //check if  existing file 
      const fileResponse = await axios.get(fileUrl, {
        headers: { Authorization: `token ${owner.giteaToken}` },
      });
      sha = fileResponse.data.sha; // Get SHA if file exists
      isExistingFile = true;
    } catch (error) {
      if (error.response?.status == 404){
        console.log(`File ${path} does not exist. Creating new file with empty SHA.`);
        sha = null; // Set SHA to empty string for new file
      } else{
        console.error("Error checking file existence:", error.response?.data || error.message);
        return res.status(500).json({ error: "Error checking file existence" });
      }
    }
    const encodedContent = Buffer.from(content, "utf-8").toString("base64");
    const requestData = {
      content: encodedContent,
      branch,
      message: isExistingFile ? `Update ${path}` : `Create ${path}`, 
    }; 
    if (isExistingFile) {
      requestData.sha = sha;
    }
    console.log("Final request payload:", JSON.stringify(requestData, null, 2));
    const response = await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${path}?branch=${branch}`,
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
    console.error('File creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create file' });
  }
};

exports.createDirectory = async (req, res) => {
  try {
    const repoId = req.params.repoId;
    if (!repoId) {
      console.error("Missing repoId in request of create dir");
      return res.status(400).json({ error: "Repository ID is required to create file" });
    }
    const { path, branch = 'main' } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    } 
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found in CreateFile' });
    } 
    const owner = await User.findById(repo.owner);
    if (!owner) {
      return res.status(404).json({ error: 'Repository owner not found' });
    }
    const formattedPath = path.replace(/\/$/, ""); 
    const dummyFilePath= `${formattedPath}/.gitkeep`;
    // Create .gitkeep file to establish directory
    const response = await axios.put(
      `${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/contents/${dummyFilePath}?branch=${branch}`,
      {
        content:  Buffer.from('').toString('base64'),
        branch,
        message: `Create directory ${formattedPath}`
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
    console.error('Directory creation error:', error);
    res.status(500).json({ error: 'Failed to create directory' });
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
    
    // Fetch collaborators from Gitea
    const response = await axios.get(`${process.env.GITEA_URL}/api/v1/repos/${owner.username}/${repo.name}/collaborators`,
      { headers: { Authorization: `token ${owner.giteaToken}` } } ); 
    const collaborators = await Promise.all(response.data.map(async c => {
      const user = await User.findOne({ username: c.username });
      return { user: user._id, permission: c.permission };
    }));

    repo.collaborators = collaborators;
    await repo.save();
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
};