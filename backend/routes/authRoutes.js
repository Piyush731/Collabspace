const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware"); // Import middleware
const User = require("../models/User");
//user dashboard route
router.get("/user", verifyToken, async (req, res) => {
  console.log("Decoded user from token:", req.user); // Log in middleware
  try {
    const user = await User.findById(req.user.id).select("username email userType createdAt");
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
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
  
      // Create a new user
      const user = new User({ username, email, password });
      await user.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
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
  
      res.status(200).json({ token, user: { username: user.username, email: user.email, userType: user.userType } });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }); 
module.exports = router;