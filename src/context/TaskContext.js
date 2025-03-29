// src/context/TaskContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchTasks = async (repoId) => {
    try {
      const res = await axios.get(`/api/tasks/${repoId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchRepoSummary = async () => {
    const res = await axios.get('/api/tasks/summary');
    return res.data;
  };

  const addComment = async (taskId, text) => {
    try {
      const res = await axios.post(`/api/tasks/${taskId}/comments`, { text });
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, comments: [...task.comments, res.data] } : task
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
    };

    const handleNotification = (notification) => {
      if (notification.user === user?._id) {
        // Show notification to user
      }
    };

    socket.on('task-updated', handleTaskUpdate);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('task-updated', handleTaskUpdate);
      socket.off('notification', handleNotification);
    };
  }, [socket, user]);

  return (
    <TaskContext.Provider value={{ 
      tasks,
      fetchTasks,
      addComment,
      fetchRepoSummary
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);