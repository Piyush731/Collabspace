// src/pages/TaskManagement.js
import React, { useState } from 'react';
import '../styles/TaskManagement.css';

function TaskManagement() {
  const [tasks, setTasks] = useState({
    todo: ['Task 1', 'Task 2'],
    inProgress: ['Task 3'],
    done: ['Task 4'],
  });

  return (
    <div className="task-management">
      <h2>Task Management</h2>
      <div className="kanban-board">
        {Object.keys(tasks).map((status) => (
          <div key={status} className="kanban-column">
            <h3>{status}</h3>
            <div className="task-list">
              {tasks[status].map((task, index) => (
                <div key={index} className="task-card">
                  {task}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskManagement;
