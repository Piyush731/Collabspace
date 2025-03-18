require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const repoRoutes = require("./routes/repoRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const initializeSocket = require("./config/socket") 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();

app.options("*", cors());
app.use(
  cors({
    //origin: ["http://localhost:3000"],
    origin: "https://collabspace-one.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you need cookies or authentication headers
  })
);


app.use(bodyParser.json());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("Backend is running!");
});


app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});


const MONGO_URL = process.env.MONGO_URL;
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err)); 

mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB Atlas");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("⚠ Mongoose disconnected from MongoDB Atlas");
});


const server = http.createServer(app); 
initializeSocket(server); 


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
