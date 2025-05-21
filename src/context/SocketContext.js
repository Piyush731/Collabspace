import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [chatSocket, setChatSocket] = useState(null);
  const [taskSocket, setTaskSocket] = useState(null);

  // Chat socket (root namespace)
  const newChatSocket = useMemo(() => {
    if (!user) return null;
    return io(API_URL, {
      autoConnect: false,
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });
  }, [user]);

  // Task socket (/tasks namespace)
  const newTaskSocket = useMemo(() => {
    if (!user) return null;
    return io(`${API_URL}/tasks`, {
      autoConnect: false,
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (chatSocket) chatSocket.disconnect();
      if (taskSocket) taskSocket.disconnect();
      return;
    }

    // Connect both sockets
    newChatSocket.connect();
    newTaskSocket.connect();
    setChatSocket(newChatSocket);
    setTaskSocket(newTaskSocket);

    return () => {
      newChatSocket.disconnect();
      newTaskSocket.disconnect();
    };
  }, [user, newChatSocket, newTaskSocket]);

  return (
    <SocketContext.Provider value={{ chatSocket, taskSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

// Separate setup for task listeners
export const setupTaskSocketListeners = (taskSocket, dispatch) => {
  if (!taskSocket) return;

  taskSocket.on('taskUpdate', (update) => {
    dispatch({ type: 'UPDATE_TASK', payload: update.task });
  });

  taskSocket.on('user-typing', ({ userId, taskId }) => {
    dispatch({ type: 'SET_TYPING_INDICATOR', payload: { userId, taskId } });
  });

  taskSocket.on('new-notification', (notifications) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: notifications });
  });
};

// Generic hook for chat events
export const useSocketEvent = (eventName, callback, socketType = 'chat') => {
  const { chatSocket, taskSocket } = useSocket();
  const socket = socketType === 'chat' ? chatSocket : taskSocket;

  useEffect(() => {
    if (!socket) return;
    
    socket.on(eventName, callback);
    return () => socket.off(eventName, callback);
  }, [eventName, callback, socket]);
};