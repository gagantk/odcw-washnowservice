const mongoose = require('mongoose');
const HttpError = require('./http-error');

const carSchema = new mongoose.Schema({
  carRegNo: {
    type: String,
    required: true,
  },
  carModel: {
    type: String,
    required: true,
  },
  carImage: {
    type: Buffer,
  },
  preferredPayment: {
    type: String,
    validate(value) {
      if (
        value.toLowerCase() !== 'pay online' &&
        value.toLowerCase() !== 'pay on delivery'
      ) {
        throw new HttpError(
          'Payment Mode can either be "Pay Online" or "Pay On Delivery" only',
          422
        );
      }
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
