import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import API_URL from "../config";

const ChatModal = ({ repoId, showChat }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!socket || !repoId) {
      console.warn("Socket or repoId is missing, cannot join room.");
      return;
    }

    console.log(`Joining chat for repository: ${repoId}`);
    socket.emit("join-repo", repoId);

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

  // Handle message send
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

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        socket.emit("send-message", {
          repoId,
          content: `<img src="${data.url}" alt="Uploaded Image" class="max-w-full rounded-lg" />`,
        });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  return (
    <AnimatePresence>
  {showChat && (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed bg-white/20 backdrop-blur-lg shadow-2xl border border-white/30 z-[999] mr-9 ${
        isExpanded
          ? "top-0 left-0 w-full h-full rounded-none"
          : "bottom-20 right-6 w-96 h-[500px] rounded-xl"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/30 flex justify-between items-center bg-white/10 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-white/20 transition"
        >
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 9V5h8v8H6z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 10V5h8v8H5z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-[calc(100%-120px)] overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] min-w-[20%] p-3 rounded-lg shadow-md relative group ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {/* Sender Name */}
                <strong
                  className={`block text-xs font-medium mb-1 ${
                    isMe ? "text-yellow-200" : "text-blue-600"
                  }`}
                >
                  {isMe ? "You" : msg.sender?.username}
                </strong>

                {/* Message Content */}
                <div className="text-sm">
                  {msg.content.includes("<img") ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="absolute bottom-1 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chat Input, Emoji Picker, and File Upload */}
      <div className="p-3 border-t border-white/30 bg-white/10 backdrop-blur-sm flex items-center gap-2 relative">
        {/* Emoji Picker Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full hover:bg-white/20 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-50">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setNewMessage((prev) => prev + emoji.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}

        {/* File Upload Button */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="p-2 rounded-full hover:bg-white/20 transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm2 10V5h8v8H6z"
              clipRule="evenodd"
            />
          </svg>
        </label>

        {/* Message Input */}
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
          placeholder="Type a message..."
        />

        {/* Send Button */}
        <motion.button
          onClick={sendMessage}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          disabled={!newMessage.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
  );
};

export default ChatModal;
