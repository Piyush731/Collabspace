import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  // Memoized WebSocket connection
  const newSocket = useMemo(() => {
    if (!user) return null;

    return io(API_URL, {
      autoConnect: false, // Prevent auto-connection before user is authenticated
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'], // Support fallback transport
      reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
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

// Custom hook for consuming the socket
export const useSocket = () => {
  return useContext(SocketContext);
};
