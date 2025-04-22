const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Repository = require('../models/Repository');
const User = require('../models/User');
const GITEA_URL = process.env.GITEA_URL;

// Initialize Git instance
const git = simpleGit();

// Get all branches
exports.getBranches = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repoPath = path.join(process.env.REPOS_DIR, repoId);
    
    const gitRepo = simpleGit(repoPath);
    const branches = await gitRepo.branch();
    
    res.json(branches.all);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// Create new branch
exports.createBranch = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { name, fromBranch } = req.body;
    // Find repository and owner
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    const owner = await User.findById(repo.owner);
    if (!owner?.giteaToken) {
      return res.status(403).json({ error: 'Gitea token missing' });
    }
    // Determine base branch
    const baseBranch = fromBranch || repo.defaultBranch || 'main';
    // Create branch via Gitea API
    const response = await axios.post(
      `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/branches`,
      { new_branch_name: name, old_branch_name: baseBranch },
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('createBranch error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

// Switch branch
exports.switchBranch = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { branch } = req.body;
    const repoPath = path.join(process.env.REPOS_DIR, repoId);
    
    const gitRepo = simpleGit(repoPath);
    await gitRepo.checkout(branch);
    
    res.json({ message: 'Switched branch successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch branch' });
  }
};

// Merge branches
exports.mergeBranches = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { source, target } = req.body;
    const repoPath = path.join(process.env.REPOS_DIR, repoId);
    
    const gitRepo = simpleGit(repoPath);
    
    // Switch to target branch
    await gitRepo.checkout(target);
    
    // Try to merge
    try {
      await gitRepo.merge([source]);
      res.json({ message: 'Merge completed successfully', hasConflicts: false });
    } catch (mergeError) {
      // Check if there are conflicts
      const status = await gitRepo.status();
      if (status.conflicted.length > 0) {
        res.json({
          message: 'Merge conflicts detected',
          hasConflicts: true,
          conflicts: status.conflicted
        });
      } else {
        throw mergeError;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge branches' });
  }
};

// Get conflicts
exports.getConflicts = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repoPath = path.join(process.env.REPOS_DIR, repoId);
    
    const gitRepo = simpleGit(repoPath);
    const status = await gitRepo.status();
    
    const conflicts = await Promise.all(
      status.conflicted.map(async (filePath) => {
        const currentContent = await fs.promises.readFile(
          path.join(repoPath, filePath),
          'utf8'
        );
        
        // Get incoming changes from the merge
        const incomingContent = await gitRepo.show([`MERGE_HEAD:${filePath}`]);
        
        return {
          filePath,
          currentContent,
          incomingContent
        };
      })
    );
    
    res.json(conflicts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
};

// Resolve conflict
exports.resolveConflict = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { filePath, resolution } = req.body;
    const repoPath = path.join(process.env.REPOS_DIR, repoId);
    
    const gitRepo = simpleGit(repoPath);
    
    if (resolution === 'ours') {
      await gitRepo.checkout(['--ours', filePath]);
    } else if (resolution === 'theirs') {
      await gitRepo.checkout(['--theirs', filePath]);
    }
    
    // Add the resolved file
    await gitRepo.add(filePath);
    
    // Check if all conflicts are resolved
    const status = await gitRepo.status();
    if (status.conflicted.length === 0) {
      // Continue the merge
      await gitRepo.commit('Resolved merge conflicts');
    }
    
    res.json({ message: 'Conflict resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve conflict' });
  }
}; 