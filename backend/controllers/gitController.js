const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const Repository = require('../models/Repository');

// Define base directory for local repos, with fallback when deploying
const REPOS_DIR = process.env.REPOS_DIR || path.join(__dirname, '../repos');
// Ensure the repos directory exists
if (!fs.existsSync(REPOS_DIR)) {
  fs.mkdirSync(REPOS_DIR, { recursive: true });
}

// Initialize Git instance
const git = simpleGit();

// Helper to clone a repo locally if missing and return a repo-specific simple-git instance
async function ensureLocalRepoInstance(repoId) {
  const repoPath = path.join(REPOS_DIR, repoId);
  // Retrieve repo and owner token
  const repoRecord = await Repository.findById(repoId).populate('owner');
  if (!repoRecord) throw new Error('Repository not found');
  const { cloneUrl, owner } = repoRecord;
  const token = owner.giteaToken;
  const username = owner.username;
  // Clone if missing
  if (!fs.existsSync(repoPath)) {
    await git.clone(cloneUrl, repoPath);
  }
  const gitRepo = simpleGit(repoPath);
  // Set up authenticated remote URL if needed
  if (token && username) {
    try {
      // Remove any stale Git config lock file
      const lockPath = path.join(repoPath, '.git', 'config.lock');
      if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
      // e.g. https://username:token@gitea.example.com/user/repo.git
      const authUrl = cloneUrl.replace(/^(https?:\/\/)/, `$1${username}:${token}@`);
      await gitRepo.remote(['set-url', 'origin', authUrl]);
    } catch (err) {
      console.error('Could not reset remote origin URL:', err.message);
    }
  }
  return gitRepo;
}

// Get all branches
exports.getBranches = async (req, res) => {
  try {
    const { repoId } = req.params;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    const branchesData = await gitRepo.branch();
    // Remove remote HEAD entries, strip remote prefixes, and dedupe
    const clean = branchesData.all
      .filter(name => !/^remotes\/origin\/HEAD/.test(name) && !/^origin\/HEAD/.test(name))
      .map(name => name.replace(/^remotes\/origin\//, '').replace(/^origin\//, ''));
    const unique = Array.from(new Set(clean));
    res.json(unique);
  } catch (error) {
    console.error('getBranches error:', error.message);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// Create new branch
exports.createBranch = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { name, fromBranch } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    // Ensure base branch exists locally
    await gitRepo.checkout(fromBranch);
    // Create and checkout new branch
    await gitRepo.checkoutLocalBranch(name);
    // Push new branch to remote
    await gitRepo.push('origin', name);
    res.status(201).json({ name });
  } catch (error) {
    console.error('createBranch error:', error.message);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

// Switch branch
exports.switchBranch = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { branch } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    await gitRepo.checkout(branch);
    res.json({ message: 'Switched branch successfully' });
  } catch (error) {
    console.error('switchBranch error:', error.message);
    res.status(500).json({ error: 'Failed to switch branch' });
  }
};

// Merge branches
exports.mergeBranches = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { source, target } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);

    // Switch to target branch
    await gitRepo.checkout(target);
    try {
      // Fetch & pull the latest target from origin to avoid non‑fast‑forward
      await gitRepo.fetch('origin', target);
      await gitRepo.pull('origin', target);
    } catch (syncErr) {
      console.warn('Could not sync target branch:', syncErr.message);
    }
    // Update remote-tracking references
    await gitRepo.fetch();

    // Attempt fast-forward merge from remote
    try {
      await gitRepo.merge(['--ff-only', `origin/${source}`]);
      // Push the fast-forwarded branch to remote
      await gitRepo.push('origin', target);
      return res.json({ message: 'Fast-forward merge completed and pushed', hasConflicts: false });
    } catch (ffErr) {
      // Attempt recursive merge from remote
      try {
        await gitRepo.merge([`origin/${source}`]);
        // Push the merge commit to remote
        await gitRepo.push('origin', target);
        return res.json({ message: 'Recursive merge completed and pushed', hasConflicts: false });
      } catch (mergeErr) {
        // Check for conflicts
        const status = await gitRepo.status();
        if (status.conflicted.length > 0) {
          return res.json({
            message: 'Merge conflicts detected',
            hasConflicts: true,
            conflicts: status.conflicted
          });
        }
        throw mergeErr;
      }
    }
  } catch (error) {
    console.error('mergeBranches error:', error);
    res.status(500).json({ error: 'Failed to merge branches', details: error.message });
  }
};

// Get merge conflicts with base, ours, and theirs for 3-way resolution
exports.getConflicts = async (req, res) => {
  try {
    const { repoId } = req.params;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    const status = await gitRepo.status();
    const conflicts = await Promise.all(
      status.conflicted.map(async (filePath) => {
        const repoPath = path.join(REPOS_DIR, repoId);
        // Base (pre-merge) content
        const baseContent = await gitRepo.show([`HEAD:${filePath}`]);
        // Current working copy with conflict markers
        const currentContent = await fs.promises.readFile(
          path.join(repoPath, filePath), 'utf8'
        );
        // Incoming changes from MERGE_HEAD
        const incomingContent = await gitRepo.show([`MERGE_HEAD:${filePath}`]);
        return { filePath, baseContent, currentContent, incomingContent };
      })
    );
    res.json(conflicts);
  } catch (error) {
    console.error('getConflicts error:', error.message);
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
};

// Resolve conflict
exports.resolveConflict = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { filePath, resolution } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    if (resolution === 'ours') {
      await gitRepo.checkout(['--ours', filePath]);
    } else {
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

// Commit resolved conflicts or staged changes
exports.commitChanges = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { branch, message } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    await gitRepo.checkout(branch);
    await gitRepo.add('.');
    await gitRepo.commit(message);
    res.json({ message: 'Committed changes successfully' });
  } catch (error) {
    console.error('commitChanges error:', error);
    res.status(500).json({ error: 'Failed to commit changes' });
  }
};

// Push committed changes to remote
exports.pushChanges = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { branch } = req.body;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    await gitRepo.push('origin', branch);
    res.json({ message: 'Pushed changes successfully' });
  } catch (error) {
    console.error('pushChanges error:', error);
    res.status(500).json({ error: 'Failed to push changes' });
  }
}; 