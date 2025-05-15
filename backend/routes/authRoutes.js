const axios = require('axios');
const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth"); // Import middleware
const User = require("../models/User"); 
require('dotenv').config(); 
const GITEA_URL = process.env.GITEA_URL;
const GITEA_ADMIN_TOKEN = process.env.GITEA_ADMIN_TOKEN; 
console.log("GITEA_URL:", GITEA_URL);
console.log("GITEA_ADMIN_TOKEN:", GITEA_ADMIN_TOKEN ? "Token Present" : "Token Missing");

//User Dashboard Route
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email userType notificationPreferences themePreference createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});
// Signup Route
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    let giteaUser; // Declare outside try block
    let sanitizedUsername;
    try {
      if (!GITEA_URL || !GITEA_ADMIN_TOKEN) {
        return res.status(500).json({ error: "Gitea URL or token missing" });
      }
      // Check MongoDB first
      sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (await User.findOne({ $or: [{ email }, { username }] })) {
        return res.status(400).json({ 
          message: "Email or username already exists" 
        });
      }
      if (!sanitizedUsername || sanitizedUsername.length < 3) {
        return res.status(400).json({ error: 'Invalid username format' });
      }
      
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password is required and must be at least 6 characters' });
        console.log("Password is required and must be at least 6 characters");
      }
           //delete if exist gitea user
           try {
      await axios.delete(
        `${GITEA_URL}/api/v1/admin/users/${username}`,
        { headers: { Authorization: `token ${GITEA_ADMIN_TOKEN}` } }
      );
    } catch (giteaError) { if (giteaError.response && giteaError.response.status !== 404) {
        console.error('Gitea cleanup error:', giteaError.response?.data);
      } else {
        console.log('No existing Gitea user to delete.');
      }
    }
       // 1. First create Gitea user
      giteaUser = await axios.post(`${GITEA_URL}/api/v1/admin/users`,
         { username : sanitizedUsername,
           email, 
           password: password, 
           login_name: sanitizedUsername,  
           send_notify: false,
           source_id: 0,
           must_change_password: false  }, 
         { headers: { Authorization: `token ${GITEA_ADMIN_TOKEN}`}}
     );
     console.log("Gitea user created successfully:", giteaUser.data);
     //token creation
     const tokenResponse = await axios.post(   //gitea token
      `${GITEA_URL}/api/v1/users/${sanitizedUsername}/tokens`,
      { name: "collabspace-token",
        scopes: [
          "read:user",          // Read user profile
        "write:user",         // Modify user profile
        "read:repository",    // Read repositories
        "write:repository",   // Modify repositories (create, delete, commit)
        "read:issue",         // Read issues & PRs
        "write:issue",        // Modify issues & PRs
        "read:notification",  // Read notifications
        "write:notification", // Modify notifications
        "read:organization",  // Read organization details
        "write:organization", // Modify organization settings
        "read:misc" 
        ]
       },
      { auth: { username: sanitizedUsername, password: password } }
    );

    // 2. Create local user with Gitea ID
    const user = new User({  username: sanitizedUsername, email, password, giteaUserId: giteaUser.data.id,
      giteaToken: tokenResponse.data.sha1
     });
    console.log("Attempting to save user:", user);
    await user.save();
    console.log("User saved successfully:", user);
    
    // 3. Generate JWT token
     const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return full user data including id and preferences
    res.status(201).json({
      user: user.toObject(),
      token
    });

  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
   // Cleanup Gitea user if MongoDB save failed
   if (giteaUser?.data?.id) {
    try {
      await axios.delete(`${GITEA_URL}/api/v1/admin/users/${sanitizedUsername}`, {
        headers: { Authorization: `token ${GITEA_ADMIN_TOKEN}` },
      });
      console.log("Rolled back Gitea user due to signup failure.");
    } catch (cleanupError) {
      console.error("Gitea rollback failed:", cleanupError.response?.data || cleanupError.message);
    }
  }

  const errorMessage = error.response?.data?.message || 
  error.message || 
  'Signup failed';

  res.status(500).json({
    error: error.response?.data?.message || 
    error.response?.data?.errors?.map(e => e.message).join(', ') || 
    'Signup failed'
  });
 }

  });
// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } 
      // Check if the password is correct
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      // Return full user data including id and preferences
      res.status(200).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          notificationPreferences: user.notificationPreferences,
          themePreference: user.themePreference,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
    } 

    router.delete('/user', verifyToken, async (req, res) => {
      try {
        // Delete from MongoDB
        await User.findByIdAndDelete(req.user._id);
    
        // Delete from Gitea
        await axios.delete(
          `${GITEA_URL}/api/v1/admin/users/${req.user.username}`,
          { headers: { Authorization: `token ${GITEA_ADMIN_TOKEN}` } }
        );
    
        res.status(200).json({ message: 'Account deleted' });
      } catch (error) {
        res.status(500).json({ error: 'Deletion failed' });
      }
    });

// Add endpoint to update user settings
router.patch("/settings", verifyToken, async (req, res) => {
  try {
    const { notificationPreferences, themePreference } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences, themePreference },
      { new: true }
    )
      .select("username email userType notificationPreferences themePreference createdAt");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
});
  }); 

module.exports = router;