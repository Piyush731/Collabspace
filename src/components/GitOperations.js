import React, { useState, useEffect } from 'react';
import { FiGitBranch, FiGitMerge, FiAlertTriangle, FiGitPullRequest } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import ConflictResolver from './ConflictResolver';

const GitOperations = ({ repoId, onBranchChange, onMergeComplete, onConflictList, onPRCreated }) => {
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [conflicts, setConflicts] = useState([]);
  const [allResolvedFiles, setAllResolvedFiles] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [prHead, setPrHead] = useState('');
  const [prBase, setPrBase] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isAutoResolving, setIsAutoResolving] = useState(false);
  const [showConflictPanel, setShowConflictPanel] = useState(true);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchConflicts();
  }, [repoId]);

  useEffect(() => {
    if (conflicts.length > 0) {
      setShowConflictPanel(true);
    }
  }, [conflicts]);

  const createPullRequest = async () => {
    if (!prHead || !prBase || !prTitle) {
      return toast.error('Select head, base and title for PR');
    }
    try {
      const res = await api.post(`/repos/${repoId}/pulls`, { head: prHead, base: prBase, title: prTitle, body: '' });
      toast.success(`PR #${res.data.number} created`);
      if (onPRCreated) onPRCreated(res.data);
      const conflictRes = await api.get(`/repos/${repoId}/pulls/${res.data.number}/conflicts`);
      if (onConflictList) onConflictList(conflictRes.data);
    } catch (error) {
      toast.error('Failed to create PR');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get(`/repos/${repoId}/branches`);
      setBranches(response.data);
      setPrHead(response.data[0] || '');
      setPrBase(currentBranch);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const fetchConflicts = async ({ page=1, limit=50 }={}) => {
    try {
      const response = await api.get(`/repos/${repoId}/conflicts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('fetchConflicts frontend error:', error.response?.data || error.message);
      toast.error(`Failed to load conflicts: ${error.response?.data?.details || error.message}`);
      return { total:0, conflicts:[] };
    }
  };

  const createBranch = async (branchName) => {
    try {
      await api.post(`/repos/${repoId}/branches`, { name: branchName });
      toast.success(`Branch ${branchName} created successfully`);
      fetchBranches();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const switchBranch = async (branchName) => {
    try {
      await api.post(`/repos/${repoId}/switch-branch`, { branch: branchName });
      setCurrentBranch(branchName);
      onBranchChange(branchName);
      toast.success(`Switched to branch ${branchName}`);
    } catch (error) {
      toast.error('Failed to switch branch');
    }
  };

  const mergeBranches = async () => {
    if (!mergeSource || !mergeTarget) {
      toast.error('Please select both source and target branches');
      return;
    }

    setIsMerging(true);
    try {
      const response = await api.post(
        `/repos/${repoId}/merge`,
        { source: mergeSource, target: mergeTarget },
        { timeout: 120000 }
      );

      if (response.data.hasConflicts) {
        toast.error('Merge conflicts detected');
        // fetch conflicts with pagination
        const confRes = await fetchConflicts({ page:1, limit:50 });
        const conflictsData = confRes.conflicts || [];
        setConflicts(conflictsData);
        setAllResolvedFiles([]);
        console.error('Merge conflicts details:', conflictsData);
      } else {
        toast.success('Merge completed successfully');
        setCurrentBranch(mergeTarget);
        onBranchChange(mergeTarget);
        await fetchBranches();
        await fetchConflicts();
        if (onMergeComplete) onMergeComplete();
      }
    } catch (error) {
      console.error('mergeBranches frontend error:', error.response?.data || error.message);
      const msg = error.response?.data?.details || error.message;
      toast.error(`Merge failed: ${msg}`);
    } finally {
      setIsMerging(false);
    }
  };

  const resolveConflict = async (filePath, resolution) => {
    try {
      await api.post(`/repos/${repoId}/resolve-conflict`, {
        filePath,
        resolution
      });
      toast.success('Conflict resolved successfully');
      fetchConflicts();
    } catch (error) {
      toast.error('Failed to resolve conflict');
    }
  };

  const handleAllResolved = (resolved) => {
    setAllResolvedFiles(resolved);
  };

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      await api.post(`/repos/${repoId}/commit`, {
        branch: mergeTarget,
        message: commitMessage || `Fixed merge conflicts in ${allResolvedFiles.join(', ')}`
      });
      toast.success('Committed changes successfully');
    } catch (error) {
      toast.error('Failed to commit changes');
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      await api.post(`/repos/${repoId}/push`, { branch: mergeTarget });
      toast.success('Pushed changes successfully');
      fetchBranches();
      fetchConflicts();
      setAllResolvedFiles([]);
      setCommitMessage('');
    } catch (error) {
      toast.error('Failed to push changes');
    } finally {
      setIsPushing(false);
    }
  };

  const handleAutoResolve = async (choice) => {
    setIsAutoResolving(true);
    const resolved = [];
    const batchSize = 5;
    try {
      for (let i = 0; i < conflicts.length; i += batchSize) {
        const batch = conflicts.slice(i, i + batchSize);
        for (const c of batch) {
          try {
            const res = await api.post(`/repos/${repoId}/resolve-conflict`, { filePath: c.filePath, resolution: choice });
            resolved.push(c.filePath);
          } catch (err) {
            console.error('Auto resolve error for', c.filePath, err.response?.data || err.message);
            toast.error(`Failed to resolve ${c.filePath}: ${err.response?.data?.details || err.message}`);
          }
        }
      }
      setAllResolvedFiles(resolved);
      toast.success(`Auto-resolved ${resolved.length} conflicts (${choice})`);
      // Refresh remaining conflicts
      const rem = await fetchConflicts({ page:1, limit:50 });
      setConflicts(rem.conflicts || []);
    } catch (e) {
      console.error('handleAutoResolve error:', e);
    } finally {
      setIsAutoResolving(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6 h-full flex flex-col overflow-auto">
      {/* Pull Request Management */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-400">
          <FiGitPullRequest /> Pull Requests
        </h3>
        <div className="flex gap-4">
          <select
            value={prHead}
            onChange={(e) => setPrHead(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={prBase}
            onChange={(e) => setPrBase(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="text"
            placeholder="PR title"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 flex-grow"
          />
          <button
            onClick={createPullRequest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Create PR
          </button>
        </div>
      </div>

      {/* Branch Management */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FiGitBranch className="text-indigo-400" />
          Branch Management
        </h3>
        
        <div className="flex gap-4">
          <select
            value={currentBranch}
            onChange={(e) => switchBranch(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const newBranch = prompt('Enter new branch name:');
              if (newBranch) createBranch(newBranch);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
          >
            Create Branch
          </button>
        </div>
      </div>

      {/* Merge Branches */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FiGitMerge className="text-indigo-400" />
          Merge Branches
        </h3>

        <div className="flex gap-4">
          <select
            value={mergeSource}
            onChange={(e) => setMergeSource(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select source branch</option>
            {branches.map((branch) => (
              <option key={`source-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <select
            value={mergeTarget}
            onChange={(e) => setMergeTarget(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select target branch</option>
            {branches.map((branch) => (
              <option key={`target-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <button
            onClick={mergeBranches}
            disabled={isMerging || !mergeSource || !mergeTarget}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isMerging ? 'Merging...' : 'Merge Branches'}
          </button>
        </div>
      </div>

      {/* Conflict Resolution and Commit Panel */}
      {conflicts.length > 0 && allResolvedFiles.length < conflicts.length && showConflictPanel && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-red-400">
            <FiAlertTriangle />
            Merge Conflicts
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleAutoResolve('ours')}
              disabled={isAutoResolving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isAutoResolving ? 'Resolving...' : 'Auto Resolve (Ours)'}
            </button>
            <button
              onClick={() => handleAutoResolve('theirs')}
              disabled={isAutoResolving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isAutoResolving ? 'Resolving...' : 'Auto Resolve (Theirs)'}
            </button>
          </div>
          <ConflictResolver
            repoId={repoId}
            conflicts={conflicts}
            onAllResolved={handleAllResolved}
            onClose={() => setShowConflictPanel(false)}
          />
        </div>
      )}

      {allResolvedFiles.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-semibold">Changes:</h3>
          <ul className="list-disc list-inside">
            {allResolvedFiles.map(f => (
              <li key={f} className="text-green-600">✓ {f} (Conflict resolved)</li>
            ))}
          </ul>
          <div>
            <label className="block text-sm font-medium text-gray-700">Commit Message:</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={`Fixed merge conflict in ${allResolvedFiles.join(', ')}`}
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCommit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              disabled={isCommitting}
            >
              {isCommitting ? 'Committing...' : `Commit to ${mergeTarget}`}
            </button>
            <button
              onClick={handlePush}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              disabled={isPushing}
            >
              {isPushing ? 'Pushing...' : 'Push Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitOperations; 