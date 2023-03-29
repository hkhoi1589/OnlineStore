const router = require('express').Router(); //route
const Checkout = require('../controllers/checkout.controller');

// get
router.get('/', Checkout.GetAll);

module.exports = router;
