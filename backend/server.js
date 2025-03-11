require('dotenv').config(); 
const express = require('express'); 
const http = require("http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Repository = require('./models/Repository');
const Message = require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const repoRoutes = require('./routes/repoRoutes');
const messageRoutes = require('./routes/messageRoutes');
const teamRoutes = require('./routes/teamRoutes'); 
const app = express();
app.options("*", cors()); 
app.use(
  cors({
    origin: ["http://localhost:3000"],
    //origin: "https://collabspace-one.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // If you need cookies or authentication headers
  })
);
app.use(bodyParser.json()); 
app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api', messageRoutes);
app.use('/api', teamRoutes); 
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const MONGO_URL = process.env.MONGO_URL; 
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB Atlas connection error:', err)); 
// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
}); 
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
}); 
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});
const { Server } = require('socket.io'); 
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    //origin: "https://collabspace-one.vercel.app",
    methods: ["GET", "POST"]
  }
}); 

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join-repo', async (repoId) => {
    // Verify repository access
    try {
      const repo = await Repository.findOne({
        _id: repoId,
        $or: [
          { owner: socket.user._id },
          { 'collaborators.user': socket.user._id}
        ]
      });

      if (!repo) {
        return socket.emit('error', 'Access denied');
      }

      socket.join(repoId);
    } catch (error) {
      socket.emit('error', 'Failed to verify access');
    }
  });
  socket.on('send-message', async (data) => {
    const { repoId, content, sender } = data;

    // Save message to database
    const message = new Message({
      content,
      sender,
      repository: repoId
    });
    await message.save();

    // Broadcast to repository room
    io.to(repoId).emit('new-message', message);
  }); 

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Add to socket.io connection handler
socket.on('code-update', async ({ repoId, path, content }) => {
  try {
    // Verify access first
    const repo = await Repository.findOne({
      _id: repoId,
      $or: [
        { owner: socket.user._id },
        { 'collaborators.user': socket.user._id }
      ]
    });

    if (repo) {
      socket.to(repoId).emit('code-update', { path, content });
    }
  } catch (error) {
    console.error('Code update error:', error);
  }
});

socket.on('join-file', (data) => {
  socket.join(`file-${data.repoId}-${data.path}`);
});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
