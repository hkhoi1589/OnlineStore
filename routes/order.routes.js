const router = require('express').Router(); //route
const Order = require('../controllers/order.controller');

// get order by id
router.get('/:orderId', Order.GetOrderById);

// add order
router.post('/', Order.AddOrder);

module.exports = router;
