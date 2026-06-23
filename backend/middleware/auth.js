import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const authorize = (roles = []) => {
  return async (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};
