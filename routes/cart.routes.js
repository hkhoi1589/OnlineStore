const router = require('express').Router(); //route
const Cart = require('../controllers/cart.controller');

// get item
router.post('/', Cart.GetCartItems);

// add item
router.post('/add', Cart.AddItemToCart);

// edit item
router.put('/edit/:id', Cart.EditCartItemQuantity);

// remove item - fix customerID thanh token
router.post('/remove/:id', Cart.RemoveItemFromCart);

// transfer item
router.post('/transfer/:id', Cart.TransferCartItem);

module.exports = router;
