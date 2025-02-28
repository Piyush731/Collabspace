// frontend/src/pages/RepositoryView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import AddMemberForm from '../components/AddMemberForm';
import BranchSelector from '../components/BranchSelector';
import CommitHistory from '../components/CommitHistory';
import RepoActions from '../components/RepoActions';
import { useAuth } from '../context/AuthContext';

const RepositoryView = () => {
  const [code, setCode] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeBranch, setActiveBranch] = useState('main');
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = io(process.env.REACT_APP_API_URL);

  // Fetch repository metadata and Gitea data
  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch basic repo metadata from our backend
        const repoRes = await fetch(`${process.env.REACT_APP_API_URL}/api/repos/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const repoJson = await repoRes.json();
        setRepoData(repoJson.metadata);

        // Fetch Gitea-specific data
        const [branchesRes, commitsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/gitea/${repoId}/branches`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.REACT_APP_API_URL}/api/gitea/${repoId}/commits`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setBranches(await branchesRes.json());
        setCommits(await commitsRes.json());

      } catch (error) {
        console.error('Error loading repository:', error);
        navigate('/dashboard');
      }
    };

    if (user) fetchRepoData();
  }, [repoId, user, navigate]);

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
    try {
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
  };

  if (!repoData) return <div className="p-4 text-gray-600">Loading repository...</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Repository Header */}
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold">{repoData.name}</h1>
            <p className="text-gray-600 text-sm">{repoData.description}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {repoData.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
              </span>
              <BranchSelector 
                branches={branches} 
                activeBranch={activeBranch}
                onChange={handleBranchChange}
              />
            </div>
          </div>
          <RepoActions repoId={repoId} cloneUrl={repoData.cloneUrl} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
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

        {/* Side Panel */}
        <div className="w-96 bg-white border-l flex flex-col">
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