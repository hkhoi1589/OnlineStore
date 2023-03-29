const router = require('express').Router(); //route
const Product = require('../controllers/product.controller');

// Get Recent Products
router.get('/', Product.GetRecentProducts);

module.exports = router;
