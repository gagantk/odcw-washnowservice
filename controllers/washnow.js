const WashRequest = require('../models/washnow');
const HttpError = require('../models/http-error');

exports.sendWashRequest = async (req, res) => {
  try {
    const carId = req.params.cid;
    const washRequest = new WashRequest({
      car: carId,
      requestApproved: false,
    });
    await washRequest.save();
    return res.json({ message: 'Wash request sent' });
  } catch (err) {
    const error = new HttpError('Sending wash request failed.', 500);
    console.log(err);
    return next(error);
  }
};

exports.respondWashRequest = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    if (req.params.resp === 'approve') {
      req.washRequest.approved = true;
      req.washRequest.requestApprovedWasher = userId;
      await req.washRequest.save();
      return res.json({ message: 'Request approved' });
    } else if (req.params.resp === 'decline') {
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
