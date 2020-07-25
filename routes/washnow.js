const express = require('express');
const router = express.Router();
const auth = require('../middleware/check-auth');

const washNowController = require('../controllers/washnow');

router.use(auth.customerAuth);

router.get('/sendWashRequest/:cid', washNowController.sendWashRequest);

router.use(auth.washerAuth);

router.get(
  '/respondWashRequest/:rid/:resp',
  washNowController.respondWashRequest
);

module.exports = router;
