// src/components/TaskDetailsModal.js
import React, { useState, useEffect } from 'react';
import CommentList from './CommentList';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../config';

const TaskDetailsModal = ({ taskId, onClose, onUpdate, onAddComment, collaborators  }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);

   useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch task');
        setTask(data);
        setEditedTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
  setSelectedAssignees(task?.assignees?.map(a => a._id) || []);
}, [task]);

const handleAssigneeChange = async (userId) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/tasks/${task._id}/assignees`,
      { userId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    setTask(res.data);
  } catch (err) {
    toast.error('Failed to update assignees');
  }
};

const handleLabelChange = async (label) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/tasks/${task._id}/labels`,
      { label },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    setTask(res.data);
  } catch (err) {
    toast.error('Failed to update labels');
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  
  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task._id, newComment);
      setNewComment('');
    }
  };

  if (loading) return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </dialog>
  );

  if (error) return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <div className="alert alert-error">
          <span>Error loading task: {error}</span>
        </div>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </dialog>
  );

  if (!task) return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <div className="alert alert-warning">
          <span>Task not found</span>
        </div>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </dialog>
  );

  return (
    <dialog id="task-details-modal" className="modal modal-open">
      <div className="modal-box bg-slate-800 text-white max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-2xl">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            ) : (
              task.title
            )}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
              />
            ) : (
              <p>{task.description}</p>
            )}
          </div>

          <div>
            <label className="label">Priority</label>
            {isEditing ? (
              <select
                name="priority"
                value={editedTask.priority}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <p className="capitalize">{task.priority}</p>
            )}
          </div>
          <div>
            <label className="label">Status</label>
            {isEditing ? (
              <select
                name="status"
                value={editedTask.status}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <p className="capitalize">{task.status}</p>
            )}
          </div>

          <div>
  <label className="label">Assignees</label>
  <div className="flex flex-wrap gap-2">
    {collaborators.map(user => (
      <label key={user._id} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedAssignees.includes(user._id)}
          onChange={() => handleAssigneeChange(user._id)}
        />
        {user.username}
      </label>
    ))}
  </div>
</div>

<div>
  <label className="label">Labels</label>
  <div className="flex flex-wrap gap-2">
    {['Bug', 'Feature', 'Backend', 'Frontend'].map(label => (
      <button
        key={label}
        onClick={() => handleLabelChange(label)}
        className={`px-2 py-1 rounded-full text-sm ${
          task.labels?.includes(label) 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-700 text-gray-300'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
</div>

          <div>
            <label className="label">Due Date</label>
            {isEditing ? (
              <input
                type="date"
                name="dueDate"
                value={editedTask.dueDate}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            ) : (
              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
            )}
          </div>
          <div className="mt-6">
        <h4 className="font-bold text-lg mb-2">Comments</h4>
        <CommentList comments={task.comments || []} />
        
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input input-bordered flex-1"
          />
          <button 
            className="btn btn-primary"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </div>
      </div>


        </div>

        <div className="modal-action">
          {isEditing ? (
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Changes
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Task
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default TaskDetailsModal;