import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import FileTree from '../components/FileTree';
import BranchSelector from '../components/BranchSelector';
import RepoActions from '../components/RepoActions';
import FileActions from '../components/FileActions';
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import { useAuth } from '../context/AuthContext';
import LoadingRepository from '../components/LoadingRepository';
import API_URL from "../config";
import ChatModal from '../components/Chat';
import AddCollaboratorModal from '../components/AddCollaboratorModal';
import { FiGitBranch, FiGitMerge, FiGitCommit } from 'react-icons/fi';
import GitOperations from '../components/GitOperations';

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
  try {
    const converted = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
     // Decode using browser's built-in function
     const decodedString = decodeURIComponent(escape(atob(converted)));
     return decodedString;
   } catch (error) {
     console.error('Base64 decoding error:', error);
     return `Failed to decode file content: ${error.message}`;
   }
 };
const RepositoryView = () => {
  const { repoId } = useParams();
  const { user } = useAuth();
  const [tabs, setTabs] = useState(['Code', 'Issues', 'PRs', 'Commits', 'README','Collaborators','JIRA Issues', 'Git Operations']);
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
const [selectedDirectory, setSelectedDirectory] = useState('');
const [issues, setIssues] = useState([]);
const [prs, setPrs] = useState([]);
const [readmeContent, setReadmeContent] = useState('');
const [stats, setStats] = useState({ stars: 0, forks: 0, issues: 0 }); 
const tabsContentRef = useRef(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
const [showChat, setShowChat] = useState(false);
const [showAddCollaborator, setShowAddCollaborator] = useState(false); 
const [collaborators, setCollaborators] = useState([]); 
const [showJiraModal, setShowJiraModal] = useState(false);
const [selectedCode, setSelectedCode] = useState('');
const [codeMarkers, setCodeMarkers] = useState([]);
const [jiraIssues, setJiraIssues] = useState([]);
const [isRepoDataLoading, setIsRepoDataLoading] = useState(true);





// Add these functions before the return statement
const handleCodeSelection = (selection) => {
  setSelectedCode(selection);
  if (selection.length > 0) {
    setShowJiraModal(true);
  }
};
const fetchJiraIssues = async () => {
  try {
    const res = await fetch(`${API_URL}/api/jira/issues?repoId=${repoId}`);
    const data = await res.json();
    setJiraIssues(data.issues);
  } catch (error) {
    toast.error('Failed to load JIRA issues');
  }
};

const handleJiraCreate = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/jira/create-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        repoId,
        filePath: selectedFile?.path,
        codeSnippet: selectedCode,
        branch: activeBranch,
        message: "Bug found in code"
      })
    });

    if (!response.ok) throw new Error('Failed to create JIRA issue');
    
    toast.success('JIRA issue created successfully!');
    setShowJiraModal(false);
  } catch (error) {
    toast.error(`JIRA creation failed: ${error.message}`);
  }
};

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
        setIsRepoDataLoading(true);
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
        setCollaborators(repoJson.gitData.collaborators || []);
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
      } finally{
        setIsRepoDataLoading(false);
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
    setCurrentDir(data);
    setCurrentPath(path);
  } catch (error) {
    console.error('Error fetching directory:', error);
    toast.error(`Error loading directory: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
 };

 // Add file/directory creation handler
const handleCreateFile = async ({ path, content }) => {
  try {
    const token = localStorage.getItem('token'); 
    const response = await fetch(`${API_URL}/api/repos/${repoId}/create-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        path,
        content,
        branch: activeBranch
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }
    if (response.ok) {
      toast.success(`created successfully`);
      fetchDirectoryContents(activeBranch, currentPath);
    }
  } catch (error) {
    toast.error(`Failed to create  file`);
  }
};

const handleCreateDirectory = async (path) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/repos/${repoId}/create-directory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        path,
        branch: activeBranch
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Directory creation failed');
    }

    toast.success('Directory created successfully');
    fetchDirectoryContents(activeBranch, currentPath);
  } catch (error) {
    console.error('Directory creation error:', error);
    toast.error(`Failed to create directory: ${error.message}`);
  }
};


const handleFolderUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  try {
    // First create all directories
    const directories = new Set();
    files.forEach(file => {
      const relativePath = file.webkitRelativePath.split('/').slice(0, -1).join('/');
      if (relativePath) directories.add(relativePath);
    });

    // Create directories first
    for (const dirPath of Array.from(directories)) {
      await handleCreateDirectory(`${currentPath}/${dirPath}`);
    }

    // Then upload files
    for (const file of files) {
      const content = await readFileAsBase64(file);
      let filePath = file.webkitRelativePath || file.name;
      filePath = currentPath ? `${currentPath}/${filePath}` : filePath;

      await handleCreateFile({
        path: filePath,
        content
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    toast.success(`Uploaded ${files.length} files successfully`);
    fetchDirectoryContents(activeBranch, currentPath);
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error.message}`);
  }
};

const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return; 
    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      for (const file of files) {
        const content = await readFileAsBase64(file);
         const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
         await handleCreateFile({
          path: fullPath,
          content: content
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      toast.success(`Uploaded ${files.length} file(s) successfully`);
      fetchDirectoryContents(activeBranch, currentPath);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
  };


  const handleDownloadZip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/repos/${repoId}/download-zip?branch=${activeBranch}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to download repository');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${repoData.name}-${activeBranch}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Download failed: ${error.message}`);
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

     if (file.type === 'file' && file.size > 1024 * 1024) {
      setFileContent('File too large to display');
      return;
    } 
    // Handle binary files differently
    if (file.name.match(/\.(png|jpg|jpeg|gif|pdf|zip)$/i)) {
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/files/${encodeURIComponent(file.path)}?ref=${activeBranch}&raw=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const text = await blob.text();
      setFileContent('Binary file - download to view');
      setCode(text);
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
  if (!repoData || !user) {
    toast.error('Repository data still loading');
    return;
  }

  try {
    // Debug: Log critical IDs and types
    console.groupCollapsed('Permission Debug Info');
    console.log('Current User:', {
      id: user?._id,
      type: typeof user?._id,
      stringified: user?._id?.toString()
    });
    
    console.log('Repo Owner:', {
      id: repoData?.owner?._id,
      type: typeof repoData?.owner?._id,
      stringified: repoData?.owner?._id?.toString()
    });

    console.log('Collaborators:', repoData?.collaborators?.map(c => ({
      userId: c?.user?._id?.toString(),
      permission: c?.permission,
      type: typeof c?.user?._id,
      match: c?.user?._id?.toString() === user?._id?.toString()
    })));

    // Permission check logic
    if (activeBranch === 'main' || activeBranch === repoData?.defaultBranch) {
      const ownerId = repoData?.owner?._id || repoData?.owner;
      const isOwner = user?._id?.toString() === ownerId?.toString();
      console.log('Is Owner:', isOwner);

      const collaborator = repoData?.collaborators?.find(c => 
        c?.user?._id?.toString() === user?._id?.toString()
      );
      console.log('Found Collaborator:', collaborator);

      const permission = collaborator?.permission?.toLowerCase();
      console.log('Normalized Permission:', permission);

      const hasPermission = ['admin', 'write'].includes(permission);
      console.log('Has Permission:', hasPermission);

      if (!isOwner && !hasPermission) {
        console.error('Permission Check Failed');
        toast.error('You need write permissions to modify main branch');
        return;
      }
    }
    console.groupEnd();

    // Rest of the save logic
    const token = localStorage.getItem('token');
    const isNewFile = !selectedFile.sha;
    const endpoint = isNewFile ? 
      `${API_URL}/api/repos/${repoId}/create-file` : 
      `${API_URL}/api/repos/${repoId}/update-file`;

    const base64Content = btoa(new TextEncoder().encode(code).reduce(
      (data, byte) => data + String.fromCharCode(byte), ''
    ));

    const body = {
      path: selectedFile.path,
      content: base64Content,
      branch: activeBranch,
      message: commitMessage || (isNewFile ? 'Create file' : 'Update file')
    };

    if (!isNewFile) {
      body.sha = selectedFile.sha;
    }

    console.log('Saving with payload:', {
      path: selectedFile.path,
      branch: activeBranch,
      isNewFile,
      sha: body.sha
    });

    const response = await fetch(endpoint, {
      method: isNewFile ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Save Failed:', errorData);
      throw new Error(errorData.message || 'Failed to save file');
    }

    const result = await response.json();
    console.log('Save Successful:', result); 
    
    toast.success(`File ${isNewFile ? 'created' : 'updated'} successfully`);
    await fetchFileContent(selectedFile);
    fetchDirectoryContents(activeBranch, currentPath);

  } catch (error) {
    console.error('Save Error:', error);
    toast.error(error.message);
  }
};

  const handleCodeChange = (value) => {
     setCode(value);
   // socket.emit('code-update', { repoId, code: value });
  };

  const handleBranchChange = (branch) => {
    setActiveBranch(branch);
    // Clear current file selection and editor state
    setSelectedFile(null);
    setFileContent('');
    setCode('');
    // Load directory for the selected branch
    fetchDirectoryContents(branch);
  };

// Handler to create a new branch via backend
const handleCreateBranch = async () => {
  const newBranch = prompt('Enter new branch name:');
  if (!newBranch) return;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/repos/${repoId}/branches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newBranch, fromBranch: activeBranch })
    });
    if (!response.ok) throw new Error('Failed to create branch');
    toast.success(`Branch "${newBranch}" created`);
    setBranches(prev => [...prev, newBranch]);
  } catch (error) {
    console.error('Create branch error:', error);
    toast.error('Failed to create branch');
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
      setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README','Collaborators','JIRA Issues','Git Operations']);
    }
    setActiveTab(1); // Switch to Editor tab
  };

  useEffect(() => {
    // Update tabs array when file is selected/deselected
    if (selectedFile && !tabs.includes('Editor')) {
      setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README','Collaborators','JIRA Issues','Git Operations']);
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

    const JiraModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-xl font-bold mb-4">Create JIRA Issue</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Selected Code:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {selectedCode}
            </pre>
          </div>
          <button 
            onClick={handleJiraCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Create Issue
          </button>
          <button
            onClick={() => setShowJiraModal(false)}
            className="mt-2 text-gray-600 hover:text-gray-800 w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    );

    if (!repoData) return <LoadingRepository />;

    return (
      <>
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
                  onChange={handleBranchChange}
                />
                <button onClick={handleCreateBranch} className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition">
                  Add Branch
                </button>
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
                          onCreateFile={handleCreateFile} // Changed from onCreate
                          onCreateDirectory={handleCreateDirectory}
                          onFolderUpload={handleFolderUpload}
                          onFileUpload={handleFileUpload}
                          onDownloadZip={handleDownloadZip}
                         // onRename={handleRename}
                         // onDelete={handleDelete}
                         // onCopy={handleCopy}
                         // onMove={handleMove}
                         // onPaste={handlePaste}
                         /// onRefresh={handleRefresh}
                         // onSearch={handleSearch}
                         // onOpenInBrowser={handleOpenInBrowser}
                         // onOpenInEditor={handleOpenInEditor}
                         // onOpenInTerminal={handleOpenInTerminal}
                         // onOpenInBrowser={handleOpenInBrowser}
                         // onOpenInEditor={handleOpenInEditor}
                         // onOpenInTerminal={handleOpenInTerminal}
                        /> 
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        <FileTree
                           repoId={repoId}
                           activeBranch={activeBranch}
                           contents={currentDir}
                           onFileSelect={async (item) => {
                            setSelectedFile(item);
                            if (!tabs.includes('Editor')) {
                              setTabs(['Code', 'Editor', 'Issues', 'PRs', 'Commits', 'README','Collaborators','JIRA Issues','Git Operations']);
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
                          selectedDirectory={currentPath}
                          setSelectedDirectory={(path) => {
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
                            disabled={isRepoDataLoading}
                          >
                            {isRepoDataLoading ? 'Loading...' : 'Save'}
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
                                onValidate={(markers) => setCodeMarkers(markers)}
    onMount={(editor) => {
      editor.onDidChangeCursorSelection(({ selection }) => {
        const selectedText = editor.getModel().getValueInRange(selection);
        handleCodeSelection(selectedText);
      });  editor.addAction({
        id: 'create-jira-issue',
        label: 'Create JIRA Issue',
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1,
        run: () => {
          const selection = editor.getSelection();
          const selectedText = editor.getModel().getValueInRange(selection);
          handleCodeSelection(selectedText);
        }
      });
    }}
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
              <p className="text-gray-700 h-full">No open issues ✨</p>
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
                  <pre className="whitespace-pre-wrap font-sans text-white m-0">
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
          

        {showAddCollaborator && (
          <AddCollaboratorModal
            repoId={repoId}
            onClose={() => setShowAddCollaborator(false)}
            onAddCollaborator={async () => {
              const token = localStorage.getItem('token');
              const repoRes = await fetch(`${API_URL}/api/repos/${repoId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const repoJson = await repoRes.json();
              setCollaborators(repoJson.gitData.collaborators);
            }}
          />
        )}

          <div className="bg-gray-50 flex flex-col flex-1 overflow-y-auto min-h-0">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-2xl font-bold">Collaborators</h2>
              <motion.button
                onClick={() => setShowAddCollaborator(true)}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Collaborator
              </motion.button>
            </div>

            {/* Owner Section */}
            <motion.div
              className="p-4 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-yellow-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold">{repoData.owner.username}</h3>
                      <p className="text-sm text-gray-600">Owner</p>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                    Admin
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Collaborators List */}
            <motion.div
              className="p-4 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {collaborators.map((collab, index) => (
                <motion.div
                  key={collab.user?._id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="font-semibold">{collab.user?.username}</h3>
                        <p className="text-sm text-gray-600">{collab.permission}</p>
                      </div>
                    </div>
                    {repoData.owner._id === collab.user?._id && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        Owner
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div> 
        </TabPanel>
        <TabPanel className="h-full flex flex-col mt-2">
          <h2>JIRA issues </h2>
        </TabPanel>

                {/* Git Operations Panel */}
                <TabPanel className="mt-[-25px] mb-25px text-white">
                  <GitOperations
                    repoId={repoId}
                    onBranchChange={(branch) => handleBranchChange(branch)}
                  />
                </TabPanel>
              </div>
            </Tabs>
          </div>
          {showJiraModal && <JiraModal />}
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
  
</>
);
};

export default RepositoryView;
