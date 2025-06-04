const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Repository = require("../models/Repository");
const typingUsers = new Map();

module.exports = function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      //origin: ["http://localhost:3000"],
      origin: ["https://collabspace-one.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    //path: "/socket.io",   rremoved 
  });

  // **WebSocket Error Handling**
  io.engine.on("connection_error", (err) => {
    console.log("❌ WebSocket Connection Error:");
    console.log("Request:", err.req);
    console.log("Code:", err.code);
    console.log("Message:", err.message);
    console.log("Context:", err.context);
  });

   // Shared Authentication Middleware
  const authMiddleware = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error"));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  };

  const chatNamespace = io.of("/chat");
  chatNamespace.use(authMiddleware);
  configureChatNamespace(chatNamespace);

  // Task Namespace
  const taskNamespace = io.of("/tasks");
  taskNamespace.use(authMiddleware);
  configureTaskNamespace(taskNamespace);
};

  function configureChatNamespace(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 New WebSocket Connection: ${socket.id} (User: ${socket.user?.username})`);

    socket.on("join-repo", async (repoId) => {
      console.log(`📥 ${socket.user.username} attempting to join repo chat: ${repoId}`);

      try {
        const repo = await Repository.findOne({
          _id: repoId,
          $or: [
            { owner: socket.user._id },
            { "collaborators.user": socket.user._id },
          ],
        }).populate('collaborators.user', '_id username permission');

        if (!repo) {
          console.warn(`⚠ Access Denied: User ${socket.user.username} is not a collaborator of repo ${repoId}`);
          return;
        }

        socket.join(repoId);
        console.log(`✅ ${socket.user.username} joined chat room for repo: ${repoId}`);

        // Fetch and send chat history
        const messages = await Message.find({ repository: repoId })
          .populate("sender", "username email")
          .sort({ createdAt: 1 });

        socket.emit("chat-history", messages);
        console.log(`📜 Chat history sent to ${socket.user.username}`);
      } catch (error) {
        console.error("❌ Error joining repository chat:", error);
      }
    });
    
    socket.on("send-message", async ({ repoId, content }) => {
      console.log(`📨 ${socket.user.username} sending message to repo: ${repoId}`);
      if (!socket.user || !socket.user._id) {
        return console.error("User not authenticated");
      }

      if (!repoId || !content.trim()) {
        console.warn("⚠ Invalid message: Missing content or repoId");
        return;
      }

      try {
        const message = new Message({
          content,
          sender: socket.user._id,
          repository: repoId,
        });

        await message.save();
        console.log(`✅ Message stored in MongoDB: ${message._id}`);

        const populatedMessage = await Message.findById(message._id).populate("sender", "username email");

        io.to(repoId).emit("new-message", populatedMessage);
        console.log(`📤 Message sent to room: ${repoId}`);
      } catch (error) {
        console.error("❌ Error saving message:", error);
      }
    });

    socket.on("leave-repo", (repoId) => {
      console.log(`📤 ${socket.user.username} leaving repo chat: ${repoId}`);
      socket.leave(repoId);
    });

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket Disconnected: ${socket.id} (User: ${socket.user?.username})`);
    });
   });
  }

  function configureTaskNamespace(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Task connection: ${socket.user.username}`);

    // Join task-specific rooms
    socket.on("join-task-room", (taskId) => {
      socket.join(`task-${taskId}`);
    });

    // Typing indicators
    socket.on("task-comment-typing", ({ repoId, taskId, isTyping }) => {
      if (isTyping) {
        typingUsers.set(socket.user._id, { repoId, taskId });
        socket.to(`repo-${repoId}`).emit("user-typing", {
          userId: socket.user._id,
          taskId,
          username: socket.user.username
        });
      } else {
        typingUsers.delete(socket.user._id);
      }
    });

    // Task updates
    socket.on("taskUpdate", async (update) => {
      try {
        const task = await Task.findByIdAndUpdate(
          update.taskId,
          update.changes,
          { new: true }
        ).populate("assignees");

        // Broadcast to repository and specific task room
        io.to(`repo-${task.repository}`)
          .to(`task-${task._id}`)
          .emit("task-updated", task);
      } catch (error) {
        console.error("Task update error:", error);
      }
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      typingUsers.delete(socket.user._id);
    });
  });
 }
