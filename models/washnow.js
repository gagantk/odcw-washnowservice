const mongoose = require('mongoose');

const washRequestSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
  requestApproved: {
    type: Boolean,
    required: true,
  },
  requestApprovedWasher: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const WashRequest = mongoose.model('WashRequest', washRequestSchema);

module.exports = WashRequest;
