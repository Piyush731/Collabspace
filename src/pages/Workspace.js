import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import UserNavbar from '../components/UserNavbar';
import GitOperations from '../components/GitOperations';
import FileTree from '../components/FileTree';
import Editor from '@monaco-editor/react';
import ChatModal from '../components/Chat';
import API_URL from '../config';
import { toast } from 'react-hot-toast';

const Workspace = () => {
  const { id: repoId } = useParams();
  const { user } = useAuth();

  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Load branches and initial directory
  useEffect(() => {
    if (repoId) fetchWorkspace();
  }, [repoId]);

  // Fetch branches and default directory
  const fetchWorkspace = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch repo metadata
      const res = await fetch(`${API_URL}/api/repos/${repoId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const branchNames = data.gitData.branches.map(b => b.name);
      setBranches(branchNames);
      const defaultBranch = data.metadata.defaultBranch || branchNames[0];
      setActiveBranch(defaultBranch);
      fetchDirectory(defaultBranch);
    } catch (err) {
      toast.error('Failed to load workspace');
    }
  };

  // Fetch directory tree for a branch
  const fetchDirectory = async (branch) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/contents?ref=${branch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dir = await res.json();
      setFiles(dir);
      setSelectedFile(null);
      setCode('');
      setActiveBranch(branch);
    } catch (err) {
      toast.error('Failed to load directory');
    }
  };

  // Load file content
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/files/${encodeURIComponent(file.path)}?ref=${activeBranch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      const content = atob(json.content);
      setCode(content);
    } catch (err) {
      toast.error('Failed to load file');
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedFile.sha ? 'update-file' : 'create-file';
      const payload = {
        path: selectedFile.path,
        content: btoa(code),
        branch: activeBranch,
        sha: selectedFile.sha
      };
      const res = await fetch(
        `${API_URL}/api/repos/${repoId}/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error('Save failed');
      toast.success('File saved successfully');
      fetchDirectory(activeBranch);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <UserNavbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: branch ops and file tree */}
          <div className="w-1/3 border-r bg-white flex flex-col">
            <GitOperations repoId={repoId} onBranchChange={fetchDirectory} />
            <FileTree
              repoId={repoId}
              activeBranch={activeBranch}
              contents={files}
              onFileSelect={handleFileSelect}
            />
          </div>
          {/* Right panel: editor or placeholder */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedFile ? (
              <>
                <button
                  onClick={handleSave}
                  className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <Editor
                  height="80%"
                  language="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={value => setCode(value)}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <p>Select a file from the tree to view or edit</p>
              </div>
            )}
          </div>
        </div>
        {/* Chat toggle */}
        <ChatModal repoId={repoId} showChat={showChat} />
        <button
          onClick={() => setShowChat(prev => !prev)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-blue-700"
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default Workspace;