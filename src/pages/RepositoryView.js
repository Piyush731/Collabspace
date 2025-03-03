import React, { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react'
import toast,{ Toaster } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import FileTree from '../components/FileTree';
import AddMemberForm from '../components/AddMemberForm';
import BranchSelector from '../components/BranchSelector';
import CommitHistory from '../components/CommitHistory';
import RepoActions from '../components/RepoActions';
import GitActions from '../components/GitActions';
import CommitDialog from '../components/CommitDialog';
import FileActions from '../components/FileActions';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary'; 
import API_URL from "../config";

const containerVariants = {     // Animation variants
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }; 
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }; 
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
  const [activeTab, setActiveTab] = useState(0);
const [fileContent, setFileContent] = useState('');
const [currentDir, setCurrentDir] = useState([]);
const [issues, setIssues] = useState([]);
const [prs, setPrs] = useState([]);
const [readmeContent, setReadmeContent] = useState('');
const [stats, setStats] = useState({ stars: 0, forks: 0, issues: 0 });
const [currentPath, setCurrentPath] = useState('');    //files
const [isLoading, setIsLoading] = useState(false);
const [isFileLoading, setIsFileLoading] = useState(false);
// Add to RepositoryView.js under API_URL declaration
// Add this AFTER your API_URL declaration
const socket = io(API_URL, {
  withCredentials: true,
  transports: ['websocket']
});
  
  
    

  // Fetch repository metadata and Gitea data
  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const repoRes = await fetch(`${API_URL}/api/repos/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
          });
        if (!repoRes.ok) throw new Error('Failed to fetch repository');
        const repoJson = await repoRes.json();
        setRepoData(repoJson.metadata);
        setBranches(repoJson.gitData.branches);
        setCommits(repoJson.gitData.commits);
        setIssues(repoJson.gitData.issues);
        setPrs(repoJson.gitData.prs);
        setStats(repoJson.gitData.stats);
        setReadmeContent(repoJson.gitData.readme?.content || '');
        fetchDirectoryContents(activeBranch);
      } catch (error) {
        console.error('Error loading repository:', error);
        navigate('/dashboard');
      }
    };

    if (user) fetchRepoData();
  }, [repoId, user, navigate]);
  
  // directory fetching function
const fetchDirectoryContents = async (branch, path = '') => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const encodedURI=encodeURIComponent(path)
    const res = await fetch(
      `${API_URL}/api/repos/${repoId}/contents?path=${encodedURI}&ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Invalid response'); 
    const data = await res.json();
    setCurrentDir(data.map(item => ({
      ...item,
      path: `${path ? `${path}/` : ''}${item.name}`
    })));
    setCurrentPath(path);
  } catch (error) {
    console.error('Error fetching directory:', error);
  } finally {
    setIsLoading(false);
  }
 };

 // Add file/directory creation handler
const handleCreateFile = async ({ path, isDirectory, content }) => {
  try {
    const token = localStorage.getItem('token');  
    const endpoint = isDirectory 
    ? `${API_URL}/api/repos/${repoId}/directories`
    : `${API_URL}/api/repos/${repoId}/files`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        path,
        content: isDirectory ? '' : content,
        branch: activeBranch
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }
    if (response.ok) {
      toast.success(`${isDirectory ? 'Directory' : 'File'} created successfully`);
      fetchDirectoryContents(activeBranch, currentPath);
    }
  } catch (error) {
    toast.error(`Failed to create ${isDirectory ? 'directory' : 'file'}`);
  }
};

 // file content fetching
const fetchFileContent = async (file) => {
  try {
    const token = localStorage.getItem('token');
    const filepath=encodeURIComponent(file.path);
    const res = await fetch(
      `${API_URL}/api/repos/${repoId}/contents/${filepath}?ref=${activeBranch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json(); 
    const content = Buffer.from(data.content, 'base64').toString();
    setFileContent(content);
    setCode(content); // Connect to editor
  } catch (error) {
    console.error('Error fetching file:', error);
  }
 };
 //Stats Component
const StatsWidget = () => (
  <div className="flex gap-4 mb-6">
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-2">
      <span>⭐</span>
      <span className="font-semibold">{stats.stars} Stars</span>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-2">
      <span>🍴</span>
      <span className="font-semibold">{stats.forks} Forks</span>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-2">
      <span>⚠️</span>
      <span className="font-semibold">{stats.issues} Open Issues</span>
    </div>
  </div> 
 );

 //old Apis
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
     try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/gitea/${repoId}/branches/${branch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCode(data.content);
      setActiveBranch(branch);
      fetchDirectoryContents(branch); 
    } catch (error) {
      console.error('Error switching branch:', error);
    toast.error('Failed to switch branch');
    } 
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
    try {
      const response = await fetch(`/api/repos/${repoId}/push`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) toast.success('Changes pushed successfully');
    } catch (error) {
      toast.error('Push failed');
    }
  };

  const handlePull = async () => {
    try {
      const response = await fetch(`/api/repos/${repoId}/pull`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCode(data.content);
        toast.success('Changes pulled successfully');
      }
    } catch (error) {
      toast.error('Pull failed');
    }
  }; 

  if (!repoData) return <div className="p-4 text-gray-600">Loading repository...</div>;
   
  const Header = () => (
    <motion.header 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm p-6 border-b border-gray-200 mt-4"
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
    {/* Header */}
    <Header />

    <div className="flex-1 flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs selectedIndex={activeTab} onSelect={setActiveTab} className="flex-1 flex flex-col">
          <TabList className="flex border-b">
            <Tab className="px-4 py-2 cursor-pointer">Code</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Issues ({issues.length})</Tab>
            <Tab className="px-4 py-2 cursor-pointer">PRs ({prs.length})</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Commits</Tab>
            <Tab className="px-4 py-2 cursor-pointer">README</Tab>
          </TabList>

          <TabPanel className="flex-1 overflow-auto p-4">
            <StatsWidget />
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* File Explorer */}
              <div className="col-span-1 overflow-y-auto">
              <FileTree
                  contents={currentDir}
                  onFileSelect={async (item) => {
                    try {
                      setIsFileLoading(true);
                      await fetchFileContent(item);
                    } finally {
                      setIsFileLoading(false);
                    }
                  }}
                  
                  currentPath={currentPath}
                  onPathChange={(path) => {
                    setCurrentPath(path);
                    fetchDirectoryContents(activeBranch, path);
                   }}
                   isLoading={isLoading} 
                   /> 
                     <FileActions 
                    path={currentPath} 
                    onCreate={handleCreateFile} 
                     /> 
              </div>
              
              
              <div className="col-span-3 flex flex-col">
  {isFileLoading ? (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ) : fileContent ? (
    <Editor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleCodeChange}
      options={{
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false
      }}
    />
  ) : (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Select a file to edit
    </div> )}
    </div>
            </div>
          </TabPanel>

          {/* Other Tab Panels remain the same as your previous implementation */}
          <TabPanel className="p-4">
            {/* Issues Content */}
          </TabPanel>
          
          <TabPanel className="p-4">
            {/* PRs Content */}
          </TabPanel>

          <TabPanel className="p-4">
            <CommitHistory commits={commits} />
          </TabPanel>

          <TabPanel className="p-4 prose max-w-none">
            {/* README Content */}
          </TabPanel>
        </Tabs>
      </div>

      {/* Right Side Panel (Keep existing structure) */}
      <div className="w-96 bg-white border-l flex flex-col">
        <CollaboratorsSection />
        <div className="p-4 border-b flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Recent Commits</h2>
          <CommitHistory commits={commits} />
        </div>
        <div className="p-4 flex-1 overflow-hidden">
          <h2 className="text-lg font-semibold mb-3">Chat</h2>
          <div className="h-full flex flex-col">
            {/* Chat implementation */}
          </div>
        </div>
      </div>
    </div>

    {/* Action Modals */}
    <CommitDialog
      isOpen={showCommitDialog}
      onClose={() => setShowCommitDialog(false)}
      onCommit={handleCommit}
    />
    <Toaster position="bottom-right" />
  </div>
  );
};

export default RepositoryView;
