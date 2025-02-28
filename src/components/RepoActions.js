import React from 'react';
import { ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline';

const RepoActions = ({ repoId, cloneUrl }) => {
  const handleCopyClone = async () => {
    await navigator.clipboard.writeText(cloneUrl);
    alert('Clone URL copied to clipboard!');
  };

  const handleDeleteRepo = async () => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_API_URL}/api/repos/${repoId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleCopyClone}
        className="flex items-center px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
      >
        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
        Clone
      </button>
      <button
        onClick={handleDeleteRepo}
        className="flex items-center px-3 py-1 border rounded-md hover:bg-red-50 text-red-600 text-sm"
      >
        <TrashIcon className="h-4 w-4 mr-1" />
        Delete
      </button>
    </div>
  );
};

export default RepoActions;