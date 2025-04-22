import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null); 
  const newSocket = useMemo(() => {
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

  useEffect(() => {
    if (!user) { 
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [user, newSocket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}; 
export const useSocket = () => {
  return useContext(SocketContext);
};
