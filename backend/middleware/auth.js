const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (requiredRole) => async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    if (user.role !== requiredRole) {
      return res.status(403).send('Access denied');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send('Authentication failed');
  }
};

module.exports = auth;