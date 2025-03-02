import React,{ useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

const CollaborativeEditor = ({ repoId, user }) => {
  const editorRef = useRef(null);
  const socket = useRef(null);
  const REACT_APP_API_URL= process.env.REACT_APP_API_URL;
  useEffect(() => {
    socket.current = io(`${REACT_APP_API_URL}`);
    socket.current.emit('join-repo', { repoId, userId: user._id });

    socket.current.on('code-update', ({ changes, userId }) => {
      if (userId !== user._id) {
        // Apply remote changes
        editorRef.current.setValue(changes);
      }
    });

    socket.current.on('user-cursor', ({ userId, position }) => {
      // Display other users' cursors
    });

    return () => {
      socket.current.disconnect();
    };
  }, [repoId, user]);

  const handleEditorChange = (value) => {
    socket.current.emit('code-change', {
      repoId,
      userId: user._id,
      changes: value
    });
  };

  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      onChange={handleEditorChange}
      onMount={(editor) => (editorRef.current = editor)}
    />
  );
};
export default CollaborativeEditor;