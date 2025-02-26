import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';

const RepositoryView = () => {
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState([]);
  const { repoId } = useParams();
  const socket = io('http://localhost:5000');

  useEffect(() => {
    socket.emit('join-repo', repoId);
    
    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.disconnect();
    };
  }, [repoId]);

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit('code-change', { repoId, code: value });
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4">
        <Editor
          height="90vh"
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
        />
      </div>
      
      <div className="w-1/4 bg-white p-4 border-l">
        {/* Chat component here */}nnn
      </div>
    </div>
  );
};

export default RepositoryView;