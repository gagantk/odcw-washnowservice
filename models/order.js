const mongoose = require('mongoose');
const HttpError = require('./http-error');

const orderSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
  washer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  washrequest: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  washPlan: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
