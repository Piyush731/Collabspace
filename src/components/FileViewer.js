import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import API_URL from '../config';

const FileViewer = () => {
  const { repoId, filePath } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const branch = location.state?.branch || 'main';

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_URL}/api/repos/${repoId}/files/${encodeURIComponent(filePath)}?ref=${branch}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!res.ok) throw new Error('Failed to load file');
        const data = await res.json();
        setContent(data.content);
        setLanguage(getLanguageFromExtension(filePath));
      } catch (error) {
        console.error('Error:', error);
        navigate(-1); // Go back on error
      }
    };

    fetchFile();
  }, [repoId, filePath, branch, navigate]);

  const getLanguageFromExtension = (path) => {
    const ext = path.split('.').pop();
    switch(ext) {
      case 'js': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg flex-1 overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          language={language}
          theme="vs-dark"
          value={content}
          options={{ readOnly: true }}
        />
      </div>
    </div>
  );
};

export default FileViewer;