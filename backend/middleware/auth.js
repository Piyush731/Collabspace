const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const axios = require('axios');
require('dotenv').config(); 
const GITEA_URL = process.env.GITEA_URL;
const GITEA_ADMIN_TOKEN = process.env.GITEA_ADMIN_TOKEN; 
console.log("GITEA_URL:", GITEA_URL);
console.log("GITEA_ADMIN_TOKEN:", GITEA_ADMIN_TOKEN ? "Token Present" : "Token Missing");
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  console.log("Received token middleware:", token);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id);
    if (!user){
      // Delete ghost Gitea user if exists
      await axios.delete(
        `${GITEA_URL}/api/v1/admin/users/${verified.username}`,
        { headers: { Authorization: `token ${GITEA_ADMIN_TOKEN}` } }
      );
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = user; // Attach the user objrct to request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;
