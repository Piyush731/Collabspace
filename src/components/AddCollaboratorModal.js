import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../config';

const AddCollaboratorModal = ({ repoId, onClose, onAddCollaborator }) => {
  const [newCollaborator, setNewCollaborator] = useState({
    username: '',
    permission: 'read',
  });

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/repos/${repoId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCollaborator),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to add collaborator');
      }
  
      onAddCollaborator();
      onClose();
      toast.success('Collaborator added successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg w-96"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <h3 className="text-lg font-semibold mb-4">Add Collaborator</h3>
        <input
          type="text"
          placeholder="Username"
          value={newCollaborator.username}
          onChange={(e) =>
            setNewCollaborator({ ...newCollaborator, username: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newCollaborator.permission}
          onChange={(e) =>
            setNewCollaborator({ ...newCollaborator, permission: e.target.value })
          }
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="read">Read</option>
          <option value="write">Write</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddCollaboratorModal;