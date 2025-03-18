import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../config";

const ChatModal = ({ repoId, showChat }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!socket || !repoId) {
      console.warn("Socket or repoId is missing, cannot join room.");
      return;
    }

    console.log(`Joining chat for repository: ${repoId}`);
    socket.emit("join-repo", repoId);

    // Debug incoming messages
    const handleNewMessage = (message) => {
      console.log("Received new message:", message);
      setMessages((prev) => [...prev, message]);
    };

    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for repo: ${repoId}`);
        const res = await fetch(`${API_URL}/api/messages/repo/${repoId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };


    socket.on("new-message", handleNewMessage);
    fetchMessages();

    return () => {
      console.log(`Leaving chat room: ${repoId}`);
      socket.off("new-message", handleNewMessage);
      socket.emit("leave-repo", repoId);
    };
  }, [socket, repoId]);

  // In Chat.js - Add socket connection listeners
useEffect(() => {
  if (!socket) return;

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return () => {
    socket.off('connect');
    socket.off('disconnect');
  };
}, [socket]);


  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !repoId) {
      console.warn("Cannot send message: Missing socket, repoId, or message.");
      return;
    }

    console.log("Sending message:", { repoId, content: newMessage });

    socket.emit("send-message", {
      repoId,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <AnimatePresence>
      {showChat && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 w-80 glass-effect rounded-lg shadow-xl border border-white/20 z-[999]"
        >
          <div className="p-4 h-96 overflow-y-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
              >
                {console.log("Rendering message:", msg)}
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
