import React, { useState, useEffect } from 'react';
import { FiGitBranch, FiGitMerge, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const GitOperations = ({ repoId, onBranchChange }) => {
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [conflicts, setConflicts] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchConflicts();
  }, [repoId]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`/api/repos/${repoId}/branches`);
      setBranches(response.data);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await axios.get(`/api/repos/${repoId}/conflicts`);
      setConflicts(response.data);
    } catch (error) {
      toast.error('Failed to fetch conflicts');
    }
  };

  const createBranch = async (branchName) => {
    try {
      await axios.post(`/api/repos/${repoId}/branches`, { name: branchName });
      toast.success(`Branch ${branchName} created successfully`);
      fetchBranches();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const switchBranch = async (branchName) => {
    try {
      await axios.post(`/api/repos/${repoId}/switch-branch`, { branch: branchName });
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
      const response = await axios.post(`/api/repos/${repoId}/merge`, {
        source: mergeSource,
        target: mergeTarget
      });

      if (response.data.hasConflicts) {
        toast.error('Merge conflicts detected');
        fetchConflicts();
      } else {
        toast.success('Merge completed successfully');
        fetchBranches();
      }
    } catch (error) {
      toast.error('Failed to merge branches');
    }
    setIsMerging(false);
  };

  const resolveConflict = async (filePath, resolution) => {
    try {
      await axios.post(`/api/repos/${repoId}/resolve-conflict`, {
        filePath,
        resolution
      });
      toast.success('Conflict resolved successfully');
      fetchConflicts();
    } catch (error) {
      toast.error('Failed to resolve conflict');
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
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

      {/* Conflict Resolution */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-red-400">
            <FiAlertTriangle />
            Merge Conflicts
          </h3>

          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <motion.div
                key={conflict.filePath}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono">{conflict.filePath}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveConflict(conflict.filePath, 'ours')}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-sm"
                    >
                      Keep Current
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.filePath, 'theirs')}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm"
                    >
                      Keep Incoming
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Current Changes</h4>
                    <pre className="text-xs overflow-auto max-h-40">
                      {conflict.currentContent}
                    </pre>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Incoming Changes</h4>
                    <pre className="text-xs overflow-auto max-h-40">
                      {conflict.incomingContent}
                    </pre>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitOperations; 