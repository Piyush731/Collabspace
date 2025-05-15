import React from 'react';
import PropTypes from 'prop-types';

const TaskCard = ({ task, onClick, showRepo }) => {
  return (
    <div className="bg-slate-800 p-3 mb-3 rounded cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-shadow">
      {showRepo && task.repository && (
        <div className="text-xs text-purple-400 mb-1 font-medium">
          {task.repository.name}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-white text-base">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {task.priority && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              task.priority === 'high' ? 'bg-red-500' : 
              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {task.priority}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <>
              <i className="bi bi-calendar"></i>
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </>
          )}
        </div>
        <span className="capitalize">{task.status}</span>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
   repository: PropTypes.shape({
      name: PropTypes.string
    }),
    labels: PropTypes.arrayOf(PropTypes.string),
    assignees: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  showRepo: PropTypes.bool
};

export default TaskCard;