require('dotenv').config();  // This must be at the very top of your `server.js`

const express = require('express'); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const repositoryRoutes = require("./routes/repositories");



dotenv.config();  // Ensure this is at the top! 

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Middleware
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

app.use('/api/auth', authRoutes);
app.use("/api/repositories", repositoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
