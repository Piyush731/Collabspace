const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  console.log("Received token middleware:", token);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id);
    if (!user) throw new Error('User not found');
    req.user = user; // Attach the decoded token payload
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;
