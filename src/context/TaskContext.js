import { createContext, useContext, useReducer, useEffect } from 'react';
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
    case 'SET_CURRENT_REPO':
      return { ...state, currentRepo: action.payload };
    case 'UPDATE_TASK':
      return {
        ...state,
        board: {
          ...state.board,
          columns: {
            ...state.board.columns,
            [action.payload.status]: state.board.columns[action.payload.status].map(task =>
              task._id === action.payload._id ? action.payload : task
            )
          }
        }
      };
    case 'ADD_TASK':
        return {
    ...state,
    board: {
      ...state.board,
      columns: {
        ...state.board.columns,
        [action.payload.status]: [
          ...state.board.columns[action.payload.status],
          action.payload
        ]
      }
    }
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    board: null,
    repos: [],
    currentRepo: null
  });
  
  const { user } = useAuth();
  const socket = useSocket();

  const fetchBoard = async (repoId) => {
    try {
      const res = await axios.get(`${API_URL}/api/repos/${repoId}/board`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      dispatch({ type: 'SET_BOARD', payload: res.data });
    } catch (err) {
      console.error('Error fetching board:', err);
    }
  };

  const fetchRepos = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/repos/my-repos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({ type: 'SET_REPOS', payload: res.data });
    return res.data; // Add return statement
  } catch (err) {
    console.error('Error fetching repos:', err);
    throw err; // Propagate error
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

  useEffect(() => {
         if (socket) {
             socket.on('taskUpdate', (update) => {
                 // Dispatch the task to reducer to update the state
                 dispatch({type: 'UPDATE_TASK', payload: update})
             })
         }

         return () => {
             if (socket) {
                 socket.off('taskUpdate')
             }
         }
     }, [socket])

  useEffect(() => {
    if (user) {
      fetchRepos();
    }
  }, [user]);

  return (
    <TaskContext.Provider value={{
      ...state,
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