const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  console.log("Received token middleware:", token);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(verified.id).then(user => {
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = verified;
      next();
    }).catch(() => res.status(401).json({ message: 'Invalid Token' }));
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;
