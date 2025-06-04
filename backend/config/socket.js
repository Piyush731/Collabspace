const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Repository = require("../models/Repository");

module.exports = function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      // origin: ["http://localhost:3000"],
      origin: ["https://collabspace-one.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  // **WebSocket Error Handling**
  io.engine.on("connection_error", (err) => {
    console.log("❌ WebSocket Connection Error:");
    console.log("Request:", err.req);
    console.log("Code:", err.code);
    console.log("Message:", err.message);
    console.log("Context:", err.context);
  });

  // **WebSocket Authentication Middleware**
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.warn("⚠ WebSocket Authentication Failed: No token provided.");
        return next(new Error("Authentication error - No token"));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔑 Decoded Token:", decoded);
      } catch (err) {
        console.error("❌ JWT Verification Failed:", err.message);
        return next(new Error("Authentication error - Invalid token"));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        console.warn(`⚠ WebSocket Authentication Failed: User ${decoded._id} not found in DB.`);
        return next(new Error("Authentication error - User not found"));
      }

      socket.user = user;
      console.log(`✅ WebSocket Authenticated: ${user.username} (ID: ${user._id})`);
      next();
    } catch (err) {
      console.error("❌ WebSocket Authentication Error:", err);
      next(new Error("Authentication error - Unexpected error"));
    }
  });

  // **WebSocket Connection & Events**
  io.on("connection", (socket) => {
    console.log(`🔌 New WebSocket Connection: ${socket.id} (User: ${socket.user?.username})`);

    // **Join Repository Room**
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

    // **Send Message**
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

    // **Leave Repository Room**
    socket.on("leave-repo", (repoId) => {
      console.log(`📤 ${socket.user.username} leaving repo chat: ${repoId}`);
      socket.leave(repoId);
    });

    // **WebSocket Disconnection**
    socket.on("disconnect", () => {
      console.log(`❌ WebSocket Disconnected: ${socket.id} (User: ${socket.user?.username})`);
    });
  });
};
