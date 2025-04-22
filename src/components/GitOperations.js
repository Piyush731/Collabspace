import React, { useState, useEffect } from 'react';
import { FiGitBranch, FiGitMerge, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import API_URL from '../config';
import ConflictResolver from './ConflictResolver';

// Create axios instance with base URL
const api = axios.create({ baseURL: API_URL });

// Automatically include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const GitOperations = ({ repoId, onBranchChange }) => {
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [conflicts, setConflicts] = useState([]);
  const [allResolvedFiles, setAllResolvedFiles] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchConflicts();
  }, [repoId]);

  const fetchBranches = async () => {
    try {
      const response = await api.get(`/api/repos/${repoId}/branches`);
      setBranches(response.data);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await api.get(`/api/repos/${repoId}/conflicts`);
      setConflicts(response.data);
    } catch (error) {
      toast.error('Failed to fetch conflicts');
    }
  };

  const createBranch = async (branchName) => {
    try {
      await api.post(`/api/repos/${repoId}/branches`, { name: branchName });
      toast.success(`Branch ${branchName} created successfully`);
      fetchBranches();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const switchBranch = async (branchName) => {
    try {
      await api.post(`/api/repos/${repoId}/switch-branch`, { branch: branchName });
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
      const response = await api.post(`/api/repos/${repoId}/merge`, {
        source: mergeSource,
        target: mergeTarget
      });

      if (response.data.hasConflicts) {
        toast.error('Merge conflicts detected');
        fetchConflicts();
        setAllResolvedFiles([]);
      } else {
        toast.success('Merge completed successfully');
        setCurrentBranch(mergeTarget);
        onBranchChange(mergeTarget);
        fetchBranches();
        fetchConflicts();
      }
    } catch (error) {
      toast.error('Failed to merge branches');
    }
    setIsMerging(false);
  };

  const resolveConflict = async (filePath, resolution) => {
    try {
      await api.post(`/api/repos/${repoId}/resolve-conflict`, {
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
      await api.post(`/api/repos/${repoId}/commit`, {
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
      await api.post(`/api/repos/${repoId}/push`, { branch: mergeTarget });
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

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6 h-full flex flex-col overflow-auto">
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
      {conflicts.length > 0 && allResolvedFiles.length < conflicts.length && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-red-400">
            <FiAlertTriangle />
            Merge Conflicts
          </h3>
          <ConflictResolver
            repoId={repoId}
            conflicts={conflicts}
            onAllResolved={handleAllResolved}
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