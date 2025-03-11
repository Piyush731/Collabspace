import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API_URL from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket']
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};