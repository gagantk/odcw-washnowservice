const WashRequest = require('../models/washnow');
const HttpError = require('../models/http-error');
const Car = require('../models/car');
const Order = require('../models/order');
const fetch = require('node-fetch');
const User = require('../models/user');

exports.sendWashRequest = async (req, res, next) => {
  try {
    const carId = req.params.cid;
    const washPlan = req.query.washplan;
    const price = req.query.price;
    const washRequest = new WashRequest({
      car: carId,
      requestApproved: false,
      requestDeclinedWashers: [],
    });
    await washRequest.save();
    const response = await fetch(`${process.env.ORDER_SERVICE}/add`, {
      method: 'POST',
      body: JSON.stringify({
        car: carId,
        washrequest: washRequest._id,
        washPlan: washPlan,
        price,
      }),
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(response.json().message);
    }
    return res.json({ message: 'Wash request sent' });
  } catch (err) {
    const error = new HttpError('Sending wash request failed.', 500);
    console.log(err);
    return next(error);
  }
};

exports.getWashRequests = async (req, res, next) => {
  let washRequests;
  try {
    washRequests = await WashRequest.find({
      requestApproved: false,
      'requestDeclinedWashers.userId': { $ne: req.userData.userId },
    }).populate({
      path: 'car',
      model: Car,
    });
  } catch (err) {
    const error = new HttpError(
      'Fetching wash requests failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({
    washRequests: washRequests.map((washRequest) =>
      washRequest.toObject({ getters: true })
    ),
  });
};

exports.respondWashRequest = async (req, res, next) => {
  try {
    if (req.washRequest === null) {
      return res.status(400).json({ message: 'Invalid wash request id' });
    }
    const userId = req.userData.userId;
    if (req.params.resp === 'approve') {
      const orderId = await Order.findOne({ washrequest: req.washRequest._id });
      req.washRequest.requestApproved = true;
      req.washRequest.requestApprovedWasher = userId;
      await req.washRequest.save();
      req.userData.user.orders.push(orderId);
      await req.userData.user.save();
      const response = await fetch(
        `${process.env.ORDER_SERVICE}/${orderId._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ washer: userId, status: 'Accepted' }),
          headers: {
            Authorization: req.headers.authorization,
            'Content-Type': 'application/json',
          },
        }
      );
      return res.json({ message: 'Request approved' });
    } else if (req.params.resp === 'decline') {
      req.washRequest.requestDeclinedWashers.push({ userId });
      await req.washRequest.save();
      return res.json({ message: 'Request declined' });
    } else {
      return res.status(400).json({ message: 'Invalid response input' });
    }
  } catch (err) {
    const error = new HttpError('Something went wrong', 500);
    console.log(err);
    return next(error);
  }
};

exports.startCarWash = async (req, res, next) => {
  const orderId = req.params.oid;
  let order;
  try {
    order = await Order.findByIdAndUpdate(orderId, { status: 'In-Process' });
  } catch (err) {
    const error = new HttpError(
      'Updating order failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({ order });
};

exports.endCarWash = async (req, res, next) => {
  const orderId = req.params.oid;
  let order;
  try {
    order = await Order.findByIdAndUpdate(orderId, { status: 'Completed' });
  } catch (err) {
    const error = new HttpError(
      'Updating order failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({ order });
};

exports.getWashers = async (req, res, next) => {
  let washers;
  try {
    washers = await User.find({ userType: 'washer' }).select('name');
  } catch (err) {
    const error = new HttpError('Failed to fetch washers', 500);
    console.log(err);
    return next(error);
  }
  res.json({
    washers: washers.map((washer) => washer.toObject({ getters: true })),
  });
};

exports.assignWasher = async (req, res, next) => {
  const washerId = req.query.washer;
  const orderId = req.query.order;

  let washRequest;
  let order;
  try {
    order = await Order.findById(orderId);
    washRequest = await WashRequest.findById(order.washrequest);
    washRequest.requestApproved = true;
    washRequest.requestApprovedWasher = washerId;
    await washRequest.save();
    const customer = await User.findById(order.customer);
    customer.orders.push(orderId);
    await customer.save();
    await fetch(`${process.env.ORDER_SERVICE}/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ washer: washerId, status: 'Accepted' }),
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    const error = new HttpError('Assigning washer failed.', 500);
    console.log(err);
    return next(error);
  }
  res.json({ message: 'Request assigned to washer' });
};
