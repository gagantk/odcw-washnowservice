const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const WashRequest = require('../models/washnow');

exports.customerAuth = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedToken._id,
      'tokens.token': token,
    });
    if (user.userType.toLowerCase() !== 'customer') {
      throw new Error('Authentication failed!');
    }
    req.userData = { userId: decodedToken._id };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};

exports.washerAuth = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedToken._id,
      'tokens.token': token,
    });
    if (user.userType.toLowerCase() !== 'washer') {
      throw new Error('Authentication failed!');
    }
    const washRequest = WashRequest.findOne({
      _id: req.params.rid,
      requestApproved: false,
    });
    if (washRequest === null) {
      return res.status(400).json({ message: 'Invalid wash request id' });
    }
    req.washRequest = washRequest;
    req.userData = { userId: decodedToken._id };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};
