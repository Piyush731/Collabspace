// components/CreateTaskModal.js
import { useState } from "react";

const CreateTaskModal = ({ 
  visible, 
  currentRepo,
  collaborators,
  onCreate, 
  onCancel 
}) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignees: [],
    labels: []
  });

  const availableLabels = [
  'Bug', 
  'Feature', 
  'Authentication', 
  'Security',
  'Backend', 
  'Frontend',
  'Improvement' // Only include if added to backend enum
];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneeToggle = (userId) => {
    setNewTask(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const toggleLabel = (label) => {
    setNewTask(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label]
    }));
  };

  const handleSubmit = () => {
    const taskData = {
      ...newTask,
      // Add repository reference and default status
      repository: currentRepo?._id,
      status: 'todo',
      // Clean empty values
      dueDate: newTask.dueDate || undefined,
      labels: newTask.labels.length ? newTask.labels : undefined
    };
    onCreate(taskData);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Create New Task</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500 h-32"
              placeholder="Task description"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Priority</label>
              <select
                name="priority"
                value={newTask.priority}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Assignees */}
           {/* Assignees Section */}
          <div>
            <label className="block text-white mb-2">Assign to</label>
            <div className="flex flex-wrap gap-2">
              {collaborators?.map(user => (
                <button
                  type="button"
                  key={user._id}
                  onClick={() => handleAssigneeToggle(user._id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                    newTask.assignees.includes(user._id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{user.username}</span>
                  {newTask.assignees.includes(user._id) && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
              ))}
              {collaborators?.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No collaborators available for this repository
                </p>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-white mb-2">Labels</label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map(label => (
                <button
                  type="button"
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    newTask.labels.includes(label)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onCreate(newTask)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!newTask.title}
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;