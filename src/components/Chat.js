import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const ChatModal = ({ repoId, showChat }) => {  // Add showChat to props
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    const fetchMessages = async () => {
      try {
       // const res = await fetch(`${API_URL}/api/messages/${repoId}`);
       // const data = await res.json();
       // setMessages(data);
      } catch (error) {
       // console.error('Failed to fetch messages:', error);
      }
    }; 

    fetchMessages();

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('new-message');
    };
  }, [repoId, socket]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit('send-message', {
      repoId,
      content: newMessage,
      sender: user._id
    });
    setNewMessage('');
  };

  return (
    <AnimatePresence>
      {showChat && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 w-80 glass-effect rounded-lg shadow-xl border border-white/20 z-[999]"
        >
          <div className="p-4 h-96 overflow-y-auto">
            {messages.map(msg => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
              >
                <strong>{msg.sender?.username}:</strong>
                <p>{msg.content}</p>
              </motion.div>
            ))}
          </div>
          <div className="p-2 border-t">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Type a message..."
            />
            <motion.button 
              onClick={sendMessage} 
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded w-full"
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;