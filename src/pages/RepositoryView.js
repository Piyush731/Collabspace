// frontend/src/pages/RepositoryView.js
import React, { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';

import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react'
import toast,{ Toaster } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import AddMemberForm from '../components/AddMemberForm';
import BranchSelector from '../components/BranchSelector';
import CommitHistory from '../components/CommitHistory';
import RepoActions from '../components/RepoActions';
import GitActions from '../components/GitActions';
import CommitDialog from '../components/CommitDialog';
import { useAuth } from '../context/AuthContext';

const RepositoryView = () => {
  const [code, setCode] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeBranch, setActiveBranch] = useState('main');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [changes, setChanges] = useState([]);
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = io(process.env.REACT_APP_API_URL,  {
    auth: {
      token: localStorage.getItem('token')
    }
  }); 
    const containerVariants = {     // Animation variants
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }; 
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    };
  
  // Fetch repository metadata and Gitea data
  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        // Fetch repo combine data from our backend
        const repoRes = await fetch(`http://localhost:5000/api/repos/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!repoRes.ok) throw new Error('Failed to fetch repository');
        const repoJson = await repoRes.json();
        setRepoData(repoJson.metadata); 
        setBranches(repoJson.gitData.branches);
        setCommits(repoJson.gitData.commits);

      } catch (error) {
        console.error('Error loading repository:', error);
        navigate('/dashboard');
      }
    };

    if (user) fetchRepoData();
  }, [repoId, user, navigate]);
  // Handle actions with modal
  const handleRepositoryAction = (action) => {
    setActionType(action);
    setIsModalOpen(true);
  }; 
  const confirmAction = () => {
    setIsModalOpen(false);
    // Handle actual action here
    toast.success(`${actionType} action performed`);
  };

  // Real-time collaboration setup
  useEffect(() => {
    if (!repoData) return;

    socket.emit('join-repo', repoId);
    
    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [repoData, repoId]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-update', { repoId, code: value });
  };

  const handleBranchChange = async (branch) => {
    setActiveBranch(branch);
    /* try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/gitea/${repoId}/branches/${branch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCode(data.content);
      setActiveBranch(branch);
    } catch (error) {
      console.error('Error switching branch:', error);
    }
      */ 
  };

  const handleCommit = async (message) => {
    try {
      const response = await fetch(`/api/repos/${repoId}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          content: code,
          branch: activeBranch
        })
      });
      
      if (response.ok) {
        toast.success('Changes committed successfully');
        setShowCommitDialog(false);
      }
    } catch (error) {
      toast.error('Commit failed');
    }
  };

  const handlePush = async () => {
    // Implement push logic using Gitea API
  };

  const handlePull = async () => {
    // Implement pull logic using Gitea API
  };




  if (!repoData) return <div className="p-4 text-gray-600">Loading repository...</div>;
   
  const Header = () => (
    <motion.header 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm p-6 border-b border-gray-200"
      variants={itemVariants}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="space-y-2">
          <motion.h1 
            className="text-3xl font-bold text-gray-900"
            variants={itemVariants}
          >
            {repoData.name}
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            variants={itemVariants}
          >
            {repoData.description || 'No description'}
          </motion.p>
          <motion.div 
            className="flex items-center space-x-4 mt-4"
            variants={itemVariants}
          >
            <span className="px-3 py-1 rounded-full bg-white border text-sm font-medium">
              {repoData.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
            </span>
            <BranchSelector 
              branches={branches} 
              activeBranch={activeBranch}
              onChange={setActiveBranch}
            />
          </motion.div>
        </div>
        <RepoActions 
          cloneUrl={repoData.cloneUrl}
          onAction={handleRepositoryAction}
          onCloneSuccess={() => toast.success('Clone URL copied to clipboard! 📋')}
        />
         <>
      <GitActions
        onCommit={() => setShowCommitDialog(true)}
        onPush={handlePush}
        onPull={handlePull}
      />
      <CommitDialog
        isOpen={showCommitDialog}
        onClose={() => setShowCommitDialog(false)}
        onCommit={handleCommit}
      />
    </>
      </div>
    </motion.header>
  );

  // Side Panel Components
  const CollaboratorsSection = () => (
    <motion.div 
      className="p-4 border-b space-y-4"
      variants={itemVariants}
    >
      <h2 className="text-xl font-semibold text-gray-800">Collaborators</h2>
      <AddMemberForm repoId={repoId} />
      <div className="space-y-3">
        {repoData.collaborators.map(collab => (
          <motion.div 
            key={collab.user._id}
            className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="font-medium">{collab.user.username}</span>
            <span className="text-sm text-gray-500">({collab.permission})</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  ); 

  return (
    <div className="flex flex-col h-screen">
    {/* Main Content - Flex container for header, editor, and side panel */}
    <div className="flex flex-1 overflow-hidden">
      {/* Left Side - Header and IDE Editor */}
      <div className="flex-1 flex flex-col mt-3">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {repoData.name}
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed">
                  {repoData.description || (
                    <span className="text-gray-400 italic">No description provided</span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {/* Visibility Badge */}
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-600">
                    {repoData.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
                  </span>

                  {/* Last Updated */}
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-1.5">⏳</span>
                    Updated {new Date(repoData.updatedAt).toLocaleDateString()}
                  </div>

                  {/* Branch Selector */}
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                    <BranchSelector
                      branches={branches}
                      activeBranch={activeBranch}
                      onChange={handleBranchChange}
                    />
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex flex-col items-end gap-3">
                <RepoActions
                  repoId={repoId}
                  cloneUrl={repoData.cloneUrl}
                  className="mt-1.5"
                />
                <div
                  className="flex items-center text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(repoData.cloneUrl);
                    toast.success('Clone URL copied!');
                  }}
                >
                  <span className="mr-1.5">📋</span>
                  Copy Clone URL
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* IDE Editor - Below Header */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false
            }}
          />
        </div>
      </div>

      {/* Side Panel - Right Side */}
      <div className="w-96 bg-white border-l flex flex-col mt-3">
        {/* Collaborators Section */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Collaborators</h2>
          <AddMemberForm repoId={repoId} />
          <div className="mt-4 space-y-2">
            {repoData.collaborators.map(collab => (
              <div key={collab.user._id} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{collab.user.username}</span>
                <span className="text-xs text-gray-500">({collab.permission})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commit History */}
        <div className="p-4 border-b flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Recent Commits</h2>
          <CommitHistory commits={commits} />
        </div>

        {/* Chat Section */}
        <div className="p-4 flex-1 overflow-hidden">
          <h2 className="text-lg font-semibold mb-3">Chat</h2>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-2">
              {/* Chat messages would be rendered here */}
            </div>
            {/* Chat input would go here */}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default RepositoryView;