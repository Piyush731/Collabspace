const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const Repository = require('../models/Repository');
const User = require('../models/User');
const axios = require('axios');
const GITEA_URL = process.env.GITEA_URL;

// Define base directory for local repos, with fallback when deploying
const REPOS_DIR = process.env.REPOS_DIR || path.join(__dirname, '../repos');
// Ensure the repos directory exists
if (!fs.existsSync(REPOS_DIR)) {
  fs.mkdirSync(REPOS_DIR, { recursive: true });
}

// Initialize Git instance
const git = simpleGit();

// Simple lock helper to prevent concurrent operations on the same repository
async function withRepoLock(repoId, operation, fn) {
  const repoPath = path.join(REPOS_DIR, repoId);
  const lockFile = path.join(repoPath, `.${operation}.lock`);
  if (fs.existsSync(lockFile)) {
    throw new Error(`${operation} already in progress`);
  }
  fs.writeFileSync(lockFile, `${Date.now()}`, 'utf8');
  try {
    return await fn();
  } finally {
    try { fs.unlinkSync(lockFile); } catch {}
  }
}

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
      // Validate token by performing a fetch, catching auth errors
      try {
        await gitRepo.fetch(['--quiet']);
      } catch (authErr) {
        throw new Error('Authentication failed: invalid or expired token');
      }
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

// Merge branches: reset target to remote, merge origin/source, detect conflicts, then push
exports.mergeBranches = async (req, res) => {
  const { repoId } = req.params;
  const { source, target } = req.body;
  // Prevent concurrent merges
  try {
    await withRepoLock(repoId, 'merge', async () => {});
  } catch (lockErr) {
    console.error('mergeBranches lock error:', lockErr.message);
    return res.status(409).json({ error: lockErr.message });
  }
  try {
    const gitRepo = await ensureLocalRepoInstance(repoId);
    // 1) Reset local target branch to remote to avoid missing files
    await gitRepo.fetch('origin', target);
    await gitRepo.checkout(target);
    await gitRepo.reset(['--hard', `origin/${target}`]);

    // 2) Fetch source updates and merge into target
    await gitRepo.fetch('origin', source);
    try {
      await gitRepo.merge(['--no-ff', `origin/${source}`]);
    } catch (mergeErr) {
      const status = await gitRepo.status();
      if (status.conflicted.length > 0) {
        console.error('mergeBranches conflicts:', status.conflicted);
        return res.json({ message: 'Merge conflicts detected', hasConflicts: true, conflicts: status.conflicted });
      }
      throw mergeErr;
    }

    // 3) Push merged target
    await gitRepo.push('origin', target);
    return res.json({ message: 'Merge completed and pushed', hasConflicts: false });
  } catch (error) {
    console.error('mergeBranches error:', error);
    res.status(500).json({ error: 'Failed to merge branches', details: error.message });
  }
};

// Get merge conflicts with base, ours, and theirs for 3-way resolution
exports.getConflicts = async (req, res) => {
  try {
    const { repoId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const gitRepo = await ensureLocalRepoInstance(repoId);
    const status = await gitRepo.status();
    const total = status.conflicted.length;
    const start = (page - 1) * limit;
    const slice = status.conflicted.slice(start, start + limit);
    const conflicts = [];
    const batchSize = 5;
    for (let i = 0; i < slice.length; i += batchSize) {
      const batch = slice.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (filePath) => {
        const repoPath = path.join(REPOS_DIR, repoId);
        const baseContent = await gitRepo.show([`HEAD:${filePath}`]);
        const currentContent = await fs.promises.readFile(path.join(repoPath, filePath), 'utf8');
        const incomingContent = await gitRepo.show([`MERGE_HEAD:${filePath}`]);
        return { filePath, baseContent, currentContent, incomingContent };
      }));
      conflicts.push(...batchResults);
    }
    res.json({ total, page, limit, conflicts });
  } catch (error) {
    console.error('getConflicts error:', error);
    res.status(500).json({ error: 'Failed to fetch conflicts', details: error.message });
  }
};

// Resolve conflict
exports.resolveConflict = async (req, res) => {
  // Prevent concurrent conflict resolution
  try {
    const { repoId } = req.params;
    await withRepoLock(repoId, 'resolve', async () => {
      const { filePath, resolution } = req.body;
      const gitRepo = await ensureLocalRepoInstance(repoId);
      if (resolution === 'ours') {
        await gitRepo.checkout(['--ours', filePath]);
      } else {
        await gitRepo.checkout(['--theirs', filePath]);
      }
      await gitRepo.add(filePath);
      const status = await gitRepo.status();
      if (status.conflicted.length === 0) {
        await gitRepo.commit('Resolved merge conflicts');
      }
      res.json({ message: 'Conflict resolved successfully' });
    });
  } catch (error) {
    console.error('resolveConflict error:', error);
    const statusCode = error.message.includes('in progress') ? 409 : 500;
    res.status(statusCode).json({ error: 'Failed to resolve conflict', details: error.message });
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

// List Pull Requests for a repo via Gitea API
exports.listPulls = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    const owner = await User.findById(repo.owner);
    if (!owner?.giteaToken) return res.status(403).json({ error: 'Gitea token missing' });
    // Fetch all PRs (open and closed)
    const url = `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/pulls?state=all`;
    const response = await axios.get(url, { headers: { Authorization: `token ${owner.giteaToken}` } });
    res.json(response.data);
  } catch (error) {
    console.error('listPulls error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to list pull requests' });
  }
};

// Create a new Pull Request via Gitea API
exports.createPull = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { head, base, title, body } = req.body;
    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    const owner = await User.findById(repo.owner);
    if (!owner?.giteaToken) return res.status(403).json({ error: 'Gitea token missing' });
    const url = `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/pulls`;
    const response = await axios.post(
      url,
      { head, base, title, body },
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('createPull error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
};

// Get conflicts for a specific Pull Request
exports.getPullConflicts = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;
    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    const owner = await User.findById(repo.owner);
    if (!owner?.giteaToken) return res.status(403).json({ error: 'Gitea token missing' });
    // Fetch PR metadata
    const prUrl = `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/pulls/${prNumber}`;
    const prRes = await axios.get(prUrl, { headers: { Authorization: `token ${owner.giteaToken}` } });
    const head = prRes.data.head.ref;
    const base = prRes.data.base.ref;
    // Merge locally to find conflicts
    const gitRepo = await ensureLocalRepoInstance(repoId);
    await gitRepo.checkout(base);
    try {
      await gitRepo.merge(['--no-commit', '--no-ff', head]);
    } catch (_) {
      // ignore merge errors
    }
    const status = await gitRepo.status();
    const conflicts = await Promise.all(
      status.conflicted.map(async (filePath) => {
        const repoPath = path.join(REPOS_DIR, repoId);
        const baseContent = await gitRepo.show([`HEAD:${filePath}`]);
        const currentContent = await fs.promises.readFile(path.join(repoPath, filePath), 'utf8');
        const incomingContent = await gitRepo.show([`MERGE_HEAD:${filePath}`]);
        return { filePath, baseContent, currentContent, incomingContent };
      })
    );
    // Abort merge
    try { await gitRepo.merge(['--abort']); } catch (_) {}
    res.json(conflicts);
  } catch (error) {
    console.error('getPullConflicts error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch pull request conflicts' });
  }
};

// Close a pull request instead of DELETE (Gitea requires PATCH to change state)
exports.deletePull = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;
    const repo = await Repository.findById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    const owner = await User.findById(repo.owner);
    if (!owner?.giteaToken) return res.status(403).json({ error: 'Gitea token missing' });
    const url = `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/pulls/${prNumber}`;
    // Patch to set state to closed
    await axios.patch(
      url,
      { state: 'closed' },
      { headers: { Authorization: `token ${owner.giteaToken}` } }
    );
    res.json({ message: 'Pull request closed successfully' });
  } catch (error) {
    console.error('closePull error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to close pull request' });
  }
};

// Delete a branch: try local+remote git deletion first, then fallback to Gitea API
exports.deleteBranch = async (req, res) => {
  const { repoId } = req.params;
  const branch = req.params.branch || req.query.branch;
  try {
    const gitRepo = await ensureLocalRepoInstance(repoId);
    // Delete local branch
    await gitRepo.deleteLocalBranch(branch, true);
    // Delete remote branch via git
    await gitRepo.push(['origin', '--delete', branch]);
    return res.json({ message: 'Branch deleted via git successfully' });
  } catch (gitErr) {
    console.warn('Git branch deletion failed, attempting Gitea API:', gitErr.message);
    // Fallback to Gitea API
    try {
      const repo = await Repository.findById(repoId);
      if (!repo) return res.status(404).json({ error: 'Repository not found' });
      const owner = await User.findById(repo.owner);
      if (!owner?.giteaToken) return res.status(403).json({ error: 'Gitea token missing' });
      const url = `${GITEA_URL}/api/v1/repos/${encodeURIComponent(owner.username)}/${encodeURIComponent(repo.name)}/branches/${encodeURIComponent(branch)}`;
      await axios.delete(url, { headers: { Authorization: `token ${owner.giteaToken}` } });
      return res.json({ message: 'Branch deleted via Gitea API successfully' });
    } catch (apiErr) {
      console.error('deleteBranch error:', apiErr.response?.data || apiErr.message);
      const msg = apiErr.response?.data?.message || 'Failed to delete branch';
      return res.status(500).json({ error: msg });
    }
  }
}; 