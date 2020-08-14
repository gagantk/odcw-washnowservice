const express = require('express');
const router = express.Router();
const auth = require('../middleware/check-auth');

const washNowController = require('../controllers/washnow');

router.get(
  '/sendWashRequest/:cid',
  auth.customerAuth,
  washNowController.sendWashRequest
);

router.get('/washrequests', auth.washerAuth, washNowController.getWashRequests);

router.get(
  '/respondWashRequest/:rid/:resp',
  auth.washerAuth,
  washNowController.respondWashRequest
);

router.get(
  '/startCarWash/:oid',
  auth.washerAuth,
  washNowController.startCarWash
);

router.get('/endCarWash/:oid', auth.washerAuth, washNowController.endCarWash);

router.get('/getWashers', auth.adminAuth, washNowController.getWashers);

router.get('/assignWasher', auth.adminAuth, washNowController.assignWasher);

module.exports = router;
