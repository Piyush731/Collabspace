// Add at the top with other imports
import { produce } from 'immer';import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import API_URL from "../config";

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOARD':
      return { ...state, board: action.payload };
    case 'SET_REPOS':
      return { ...state, repos: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_CURRENT_REPO':
      return { ...state, currentRepo: action.payload };
    // Optimize task updates with shallow comparison
case 'UPDATE_TASK':
      return produce(state, draft => {
        // Find the task in all columns
        Object.entries(draft.board.columns).forEach(([columnName, tasks]) => {
          const taskIndex = tasks.findIndex(t => t._id === action.payload._id);
          if (taskIndex > -1) {
            draft.board.columns[columnName][taskIndex] = {
              ...tasks[taskIndex],
              ...action.payload
            };
          }
        });
      });
    case 'ADD_TASK': {
  const statusToAdd = action.payload.status || 'todo'; // Default to 'todo'
  
  const currentBoard = state.board || {
    columns: {
      backlog: [],
      todo: [],
      'in-progress': [],
      review: [],
      done: []
    }
  };

  return {
    ...state,
    board: {
      ...currentBoard,
      columns: {
        ...currentBoard.columns,
        [statusToAdd]: [
          action.payload,
          ...(currentBoard.columns[statusToAdd] || [])
        ]
      }
    }
  };
}
 case 'REMOVE_TASK':
  const newColumns = { ...state.board.columns };
  Object.keys(newColumns).forEach(col => {
    newColumns[col] = newColumns[col].filter(t => t._id !== action.payload._id);
  });
  return {
    ...state,
    board: {
      ...state.board,
      columns: newColumns
    }
  };

   case 'MOVE_TASK': {
  if (!action.payload.from || !action.payload.to) {
    console.error('Invalid move action:', action);
    return state;
  }
  
  const newColumns = JSON.parse(JSON.stringify(state.board?.columns || {
    backlog: [], todo: [], 'in-progress': [], review: [], done: []
  }));

  // Remove from all columns
  Object.keys(newColumns).forEach(col => {
    newColumns[col] = newColumns[col].filter(t => t._id !== action.payload.task._id);
  });

  // Add to new column
  if (newColumns[action.payload.to]) {
    newColumns[action.payload.to].unshift(action.payload.task);
  }

  return {
    ...state,
    board: {
      ...state.board,
      columns: newColumns
    }
  };
}
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    board: null,
    repos: [],
    tasks: [],
    currentRepo: null
  });
  
  const { user } = useAuth();
  const { taskSocket } = useSocket();

  const fetchBoard = async (repoId) => {
    try {
      const res = await axios.get(`${API_URL}/api/repos/${repoId}/board`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      dispatch({ type: 'SET_BOARD', payload: res.data });
    } catch (err) {
      toast.error('Failed to load board: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching board:', err);
    }
  };

  const fetchRepos = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/repos/my-repos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({ type: 'SET_REPOS', payload: res.data });
    return res.data; 
  } catch (err) {
    console.error('Error fetching repos:', err);
     toast.error('Failed to load repositories: ' + (err.response?.data?.error || err.message));
    throw err;
  }
};

 const createTask = async (taskData) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/repos/${taskData.repository}/tasks`, // Updated endpoint
      taskData,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    dispatch({ type: 'ADD_TASK', payload: res.data });
    fetchBoard(taskData.repository); // Refresh the board
    return res.data;
  } catch (err) {
    console.error('Error creating task:', err);
    throw err;
  }
};

  // In TaskContext.js - Update syncWithGitea
const syncWithGitea = async (repoId) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/repos/${repoId}/board/sync-gitea`, // Correct endpoint
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    fetchBoard(repoId);
    toast.success(`Synced ${res.data.syncedIssues} issues with Gitea`);
  } catch (err) {
    toast.error('Sync failed: ' + (err.response?.data?.error || err.message));
  }
};

 // Modify socket listener
useEffect(() => {
  if (taskSocket) {
    taskSocket.on('taskUpdate', (update) => {
      if (update.action === 'move') {
        if (!update.from || !update.to) {
          console.error('Invalid move event:', update);
          return;
        }
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            task: update.task,
            from: update.from,
            to: update.to
          }
        });
      }
    });
  }
}, [taskSocket]);

  useEffect(() => {
    if (user) {
      fetchRepos();
    }
  }, [user]);

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchRepos,
      fetchBoard,
      createTask,
      syncWithGitea,
      setCurrentRepo: (repo) => dispatch({ type: 'SET_CURRENT_REPO', payload: repo })
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};