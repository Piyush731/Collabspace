import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { FiX } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ConflictResolver = ({ repoId, conflicts, onAllResolved, onClose }) => {
  const [index, setIndex] = useState(0);
  const [resolvedFiles, setResolvedFiles] = useState([]);
  // Guards after initializing hooks
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="relative p-4 text-center text-gray-500">
        <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
          <FiX />
        </button>
        No merge conflicts to resolve.
      </div>
    );
  }
  if (index >= conflicts.length) {
    return (
      <div className="relative p-4 text-center text-gray-500">
        <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
          <FiX />
        </button>
        All conflicts have been processed.
      </div>
    );
  }
  const currentConflict = conflicts[index];

  const handleAccept = async (choice) => {
    try {
      await api.post(`/repos/${repoId}/resolve-conflict`, {
        filePath: currentConflict.filePath,
        resolution: choice
      });
      const updated = [...resolvedFiles, currentConflict.filePath];
      setResolvedFiles(updated);
      if (index + 1 < conflicts.length) {
        setIndex(index + 1);
      } else {
        toast.success('All conflicts resolved');
        onAllResolved(updated);
      }
    } catch (error) {
      console.error('ConflictResolver.handleAccept error:', error.message);
      toast.error(`Failed to resolve conflict: ${error.message}`);
    }
  };

  return (
    <div className="relative space-y-4">
      <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
        <FiX />
      </button>
      <h3 className="text-lg font-semibold">Resolving: {currentConflict.filePath}</h3>
      <div className="bg-white dark:bg-slate-800 p-4 rounded">        
        <DiffEditor
          height="300px"
          language="javascript"
          original={currentConflict.currentContent}
          modified={currentConflict.incomingContent}
          options={{ renderSideBySide: false, readOnly: true }}
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => handleAccept('ours')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Accept Current
        </button>
        <button
          onClick={() => handleAccept('theirs')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Accept Incoming
        </button>
      </div>
    </div>
  );
};

export default ConflictResolver; 