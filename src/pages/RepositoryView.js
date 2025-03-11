import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast,{ Toaster } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import FileTree from '../components/FileTree';
import BranchSelector from '../components/BranchSelector';
import RepoActions from '../components/RepoActions';
import FileActions from '../components/FileActions';
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import { useAuth } from '../context/AuthContext';
import API_URL from "../config"; 
import ChatModal from '../components/Chat';
// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      when: "beforeChildren"
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120
    }
  }
};

const listItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 120
    }
  })
};
const decodeBase64 = (base64) => {
  // Add padding if needed
  let padded = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  padded += '='.repeat(padLength);

  try {
    const binaryString = atob(padded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error('Base64 decoding error:', error);
    return 'Failed to decode file content';
  }
};
const RepositoryView = () => {
  const { repoId } = useParams();
  const { user } = useAuth();
  const [tabs, setTabs] = useState(['Code', 'Issues', 'PRs', 'Commits', 'README','Collaborators']);
  const [repoData, setRepoData] = React.useState(null);
  const [branches, setBranches] = React.useState([]);
  const [activeBranch, setActiveBranch] = useState('main');
  const [commits, setCommits] = useState([]);
  const [commitMessage, setCommitMessage] = useState('Update file');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [code, setCode] = useState('');  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [actionType, setActionType] = useState('');
  const navigate = useNavigate();
  const [currentDir, setCurrentDir] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const editorContainerRef = useRef(null);
  const [editorDimensions, setEditorDimensions] = useState({ width: 0, height: 0 }); 
const [isLoading, setIsLoading] = useState(false);
const [isFileLoading, setIsFileLoading] = useState(false);
const [issues, setIssues] = useState([]);
const [prs, setPrs] = useState([]);
const [readmeContent, setReadmeContent] = useState('');
const [stats, setStats] = useState({ stars: 0, forks: 0, issues: 0 }); 
const tabsContentRef = useRef(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
const [showChat, setShowChat] = useState(false);
const [showAddCollaborator, setShowAddCollaborator] = useState(false); 

const socket = io(API_URL, {
  withCredentials: true,
  transports: ['websocket']
});

useEffect(() => {
  if (tabsContentRef.current) {
    tabsContentRef.current.scrollTop = 0;
  }
}, [activeTab]);

//RESIZER FOR EDITOR
useEffect(() => {
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    setEditorDimensions({ width, height });
  });

  if (editorContainerRef.current) resizeObserver.observe(editorContainerRef.current);
  return () => resizeObserver.disconnect();
}, []);

  // Fetch repository metadata and Gitea data   BELOW IS CODE TAB FUNC
  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        console.log("Fetching contents for repoId:", repoId); 
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
        if (!repoJson.gitData.readme?.content) {
          const readmeRes = await fetch(
            `${API_URL}/api/repos/${repoId}/files/README.md?ref=${activeBranch}`
          );
          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            setReadmeContent(readmeData.content);
            console.log("Readme content: under if block");
          }
        }
        else{setReadmeContent(repoJson.gitData.readme?.content || null);
          console.log("Readme content: under else block");
        } 
        fetchDirectoryContents(activeBranch);
        console.log('Default branch:', repoJson.metadata.defaultBranch);
        setActiveBranch(repoJson.metadata.defaultBranch || 'main');
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
    const encodedURI= path === '' ? '' : encodeURIComponent(path);
    const res = await fetch(
      `${API_URL}/api/repos/${repoId}/contents?path=${encodedURI}&ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Invalid response'); 
    const data = await res.json();
    //setCurrentDir(data.map(item => ({
     // ...item,
     // path: `${path ? `${path}/` : ''}${item.name}`
    //})));
    setCurrentDir(data);
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
    console.log("Creating:", isDirectory ? "Directory" : "File", "at", path);
    const endpoint = isDirectory 
    ? `${API_URL}/api/repos/${repoId}/create-directory`
    : `${API_URL}/api/repos/${repoId}/create-file`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        path,
        content: isDirectory ? ' ' : content,
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
    //const filepath=encodeURIComponent(file.path);
    const res = await fetch(
      `${API_URL}/api/repos/${repoId}/files/${encodeURIComponent(file.path)}?ref=${activeBranch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(await res.json().error || 'Failed to fetch file');
    const data = await res.json(); 
     // Clear previous content first
     setFileContent('');
     setCode('');

    if (file.type === 'file' && file.size > 1024 * 1024) { // 1MB limit
      setFileContent('File too large to display');
      setCode('');
    }else{
      const decodedContent = decodeBase64(data.content);
      console.log('Decoded content:', decodedContent); // Add debug log
      setFileContent(decodedContent);
      setCode(decodedContent);
    }
    // Force editor update
    setTimeout(() => {
      setEditorDimensions(prev => ({ ...prev }));
    }, 100);
  } catch (error) {
    console.error('Error fetching file:', error);
    setFileContent('');
    setCode(''); 
    toast.error(`Failed to load file: ${error.message}`);
  }
 };

 const handleSave = async () => {
  if (!selectedFile) {
    toast.error('No file selected');
    return;
  }
  if (user._id !== repoData.owner._id && activeBranch === 'main') {
    const hasWriteAccess = repoData.collaborators.find(c => 
      c.user._id === user._id && ['admin', 'write'].includes(c.permission)
    );
    
    if (!hasWriteAccess) {
      toast.error('You need write permissions to modify main branch');
      return;
    }
  }
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/repos/${repoId}/create-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        path: selectedFile.path,
        content: code,
        branch: activeBranch,
        message: commitMessage || 'Update file',  // Add commit message
        sha: selectedFile.sha  // Add SHA from file metadata
      })
    });
    if (!response.ok) throw new Error('Failed to save file');
    toast.success('File saved successfully');
    await fetchFileContent(selectedFile); // Refresh content
    fetchDirectoryContents(activeBranch, currentPath); // Refresh file tree
  } catch (error) {
    toast.error(error.message);
  }
}; 

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


//below is tabs UI functions//MOCK DATA TETSING UI
  const [files] = useState([   
    { name: 'index.js', path: 'src/index.js', content: 'console.log("Hello World");' },
    { name: 'index.css', path: 'src/index.css', content: 'body { margin: 0; }' },
  ]);
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileContent(file.content);
    if (!tabs.includes('Editor')) {
      setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README','Collaborators']);
    }
    setActiveTab(1); // Switch to Editor tab
  };

  useEffect(() => {
    // Update tabs array when file is selected/deselected
    if (selectedFile && !tabs.includes('Editor')) {
      setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README']);
    } else if (!selectedFile && tabs.includes('Editor')) {
      const newTabs = tabs.filter(tab => tab !== 'Editor');
      setTabs(newTabs);
      if (activeTab > newTabs.length - 1) {
        setActiveTab(0);
      }
    }
  }, [selectedFile]);

  const handleTabSelect = (index) => {
    setActiveTab(index);
  };

  //header functions
  // Simplified data fetching for header
  React.useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/repos/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch repository');
        const data = await response.json();
        
        setRepoData(data.metadata);
        setBranches(data.gitData.branches);
      } catch (error) {
        console.error('Error loading repository:', error);
      }
    };

    if (user) fetchHeaderData();
  }, [repoId, user]); 


const handleRepositoryAction = (action) => {
      setActionType(action);
      setIsModalOpen(true);
    }; 


  if (!repoData) return <div className="p-4 text-gray-600">Loading repository...</div>; 

  return (
    <div className="flex flex-col h-screen bg-gray-50 mt-4">

     <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Header Component */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm px-6 py-4 border-b border-gray-200"
      >
         <div className="max-w-7xl mx-auto flex items-center justify-between">
      <motion.div className="space-y-1" variants={containerVariants}>
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          variants={itemVariants}
        >
          {repoData.name}
        </motion.h1>
        <motion.p 
          className="text-gray-600"
          variants={itemVariants}
        >
          {repoData.description || 'No description provided'}
        </motion.p>
        <motion.div 
          className="flex items-center gap-3 mt-3"
          variants={containerVariants}
        >
          <motion.span 
            className="px-3 py-1 rounded-full bg-white border text-sm font-medium shadow-sm"
            variants={itemVariants}
          >
            {repoData.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
          </motion.span>
          <BranchSelector 
            branches={branches} 
            activeBranch={activeBranch}
            onChange={setActiveBranch}
          />
        </motion.div>
      </motion.div>
      
      <motion.div className="flex items-center gap-4" variants={containerVariants}>
        <RepoActions 
          cloneUrl={repoData.cloneUrl}
          onAction={handleRepositoryAction}
          onCloneSuccess={() => toast.success('Clone URL copied! 📋')}
        /> 
      </motion.div>
    </div>
      </motion.header>

     {/* Tabs Section */}
     <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          selectedIndex={activeTab}
          onSelect={handleTabSelect}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabList className="flex space-x-1 bg-white border-b border-gray-200 px-4">
            {tabs.map((tab, index) => (
              <Tab
                key={tab}
                className={`
                  px-4 py-3 cursor-pointer text-sm font-medium 
                  ${activeTab === index ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}  
                  transition-colors focus:outline-none
                `}  
              >
                <div className="relative flex items-start justify-center">
                  {tab}
                  <AnimatePresence>
                    {activeTab === index && (
                      <motion.div
                        key="underline"
                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="tabUnderline"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </Tab>
            ))}
          </TabList>

          {/* Tab Panels */}
          <div className="flex flex-col overflow-hidden bg-gray-50"    ref={tabsContentRef}>
             {/* Code Tab - File Browser */}
            <TabPanel className="h-full"> 
                <motion.div 
                  className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <FileActions 
                      path={currentPath} 
                      onCreate={handleCreateFile} 
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    <FileTree
                      contents={currentDir}
                      onFileSelect={async (item) => {
                        setSelectedFile(item);
                        if (!tabs.includes('Editor')) {
                          setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README','Collaborators']);
                        }
                        setActiveTab(1); // Force switch to Editor tab
                    
                        try {
                          setIsFileLoading(true);
                          await fetchFileContent(item);
                        } catch (error) {
                          toast.error(`Failed to load file: ${error.message}`);
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
                  </div>
                </motion.div>
            </TabPanel>

            {/* Dynamic Editor Tab */}
            {tabs.includes('Editor') && (
              <TabPanel className="h-full flex flex-col">
                  
                  <motion.div 
                    className="h-full flex flex-col overflow-hidden z-18"
                    ref={editorContainerRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-lg font-semibold text-gray-800">Editor</h2>
                    <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
                    <input
                     type="text"
                    placeholder="Commit message"
                   value={commitMessage}
                   onChange={(e) => setCommitMessage(e.target.value)}
                   className="px-3 py-1 border rounded flex-grow mr-2 max-w-md"
                    />
                      <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode='wait'>
                      {isFileLoading ? (
                        <motion.div
                          key="loading"
                          className="flex-1 flex items-center justify-center h-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
                          />
                        </motion.div>
                      ) : fileContent ? (
                        <motion.div
                          key="editor"
                          className="h-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Editor
                            height={`${Math.max(editorDimensions.height, 500)}px`}
                            width="100%"
                            language="javascript"
                            theme="vs-dark"
                            value={code|| '' }
                            onChange={handleCodeChange}
                            options={{
                              minimap: { enabled: true },
                              automaticLayout: true,
                              scrollBeyondLastLine: false,
                              readOnly: fileContent === 'File too large to display',
                              padding: { top: 20, bottom: 20 }
                            }}
                            key={selectedFile?.path || 'empty'}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          className="flex-1 flex flex-col items-start justify-center h-full p-8 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="text-4xl mb-4">📁</div>
                          <p className="text-gray-500 text-lg">
                            {currentDir.length 
                              ? "Select a file to begin editing"
                              : "This directory is empty"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  </motion.div> 
              </TabPanel>
            )}

            {/* issues */}
            <TabPanel className="h-full flex flex-col mt-2">
            <div className="bg-gray-50 flex flex-col flex-1 overflow-y-auto min-h-0">
          <h2 className="text-2xl font-bold mb-4 text-black">Issues ({issues.length})</h2>
         <div className="p-3 space-y-3">
         {issues.map(issue => (
        <div key={issue.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-black">
          <div className="flex items-start gap-3">
            <span className={`px-2 py-1 rounded-full text-sm ${
              issue.state === 'open' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {issue.state}
            </span>
            <h3 className="font-semibold text-black">{issue.title}</h3>
          </div>
          <p className="text-gray-700 text-sm">{issue.body?.substring(0, 150)}...</p>
        </div>
      ))}
      {issues.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-black">
          <p className="text-gray-700 h-full">No open issues 🎉</p>
        </div>
      )}
    </div>
  </div>
            </TabPanel>

            <TabPanel className="h-full flex flex-col mt-2">
              <div className="bg-gray-50 flex flex-col flex-1 overflow-y-auto min-h-0">
     <h2 className="text-2xl font-bold mb-6 text-black">Pull Requests ({prs.length})</h2>
     <div className="p-3 space-y-3">
       {prs.map(pr => (
        <div key={pr.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-black">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-sm ${
              pr.state === 'open' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {pr.state}
            </span>
            <h3 className="font-semibold text-black">{pr.title}</h3>
          </div>
          <p className="text-gray-700 text-sm">{pr.body?.substring(0, 150)}...</p>
        </div>
      ))}
      {prs.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-black">
          <p className="text-gray-700 h-full">No open pull requests ✨</p>
        </div>
      )}
    </div>
  </div>
            </TabPanel>

            <TabPanel className="h-full flex flex-col mt-2">
  <div className="bg-gray-50 flex flex-col flex-1 overflow-y-auto min-h-0">
    {/* Title fixed at the top */}
    <h2 className="text-2xl font-bold mb-6 text-black">
      Commit History ({commits.length})
    </h2>

    {/* Scrollable container with increased height */}
    <div className="p-3 space-y-3 ">
      {commits.map(commit => (
        <div key={commit.sha} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🚀</span>
            </div>
            <div>
              <p className="font-medium text-black">{commit.commit.message.split('\n')[0]}</p>
              <p className="text-sm text-gray-700">
                {new Date(commit.commit.author.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <code className="mt-2 inline-block bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
            {commit.sha.slice(0,7)}
          </code>
        </div>
      ))}
    </div>
  </div>
</TabPanel>

<TabPanel className="h-full flex flex-1">
  <div className="bg-gray-50 flex-1 overflow-y-auto h-full min-h-0">
    <div className="flex items-center justify-between px-6 pt-3 pb-2">
      <h2 className="text-2xl font-bold text-black">README</h2>
      <button
        onClick={() => {
          // Simulate clicking the README file in the file tree
          const readmeFile = {
            path: 'README.md',
            type: 'file',
            content: readmeContent
          };
          setSelectedFile(readmeFile);
          setActiveTab(tabs.indexOf('Editor')); // Switch to Editor tab
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
      >
        Edit README
      </button>
    </div>
    <div className="flex-1 overflow-y-auto px-6 mb-20">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading README...</p>
          </div>
        </div>
      ) : readmeContent ? (
        <article className="prose max-w-none bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <pre className="whitespace-pre-wrap font-sans text-black m-0">
            {readmeContent}
          </pre>
        </article>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center py-8 text-black">
            <p className="text-gray-700">No README.md file found</p>
            <p className="text-sm text-gray-600 mt-2">
              Add a README to describe your project
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
</TabPanel>
<TabPanel className="h-full flex flex-col mt-2">
  <div className="bg-gray-50 flex flex-col flex-1 overflow-y-auto min-h-0">
    <div className="flex justify-between items-center p-4">
      <h2 className="text-2xl font-bold">Collaborators</h2>
      <button 
        onClick={() => setShowAddCollaborator(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Add Collaborator
      </button>
    </div>
    <div className="p-4 space-y-3">
      {repoData.collaborators.map(collab => (
        <div key={collab.user._id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{collab.user.username}</h3>
              <p className="text-sm text-gray-600">{collab.permission}</p>
            </div>
            {collab.user._id === repoData.owner._id && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Owner</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
</TabPanel>



          </div>
        </Tabs>
      </div>
      <ChatModal repoId={repoId} showChat={showChat} />
      <motion.button 
  onClick={() => setShowChat(!showChat)}
  className="fixed bottom-4 right-4 bg-blue-600/90 text-white p-4 rounded-full shadow-lg z-[999] hover-scale glass-effect"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  <motion.div
    animate={{ rotate: showChat ? 0 : 360 }}
    transition={{ duration: 0.5 }}
  >
    💬
  </motion.div>
</motion.button> 

      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg',
          iconTheme: {
            primary: '#3B82F6',
            secondary: '#FFFFFF',
          },
        }}
      />
    </div>
    
  );
};

export default RepositoryView;