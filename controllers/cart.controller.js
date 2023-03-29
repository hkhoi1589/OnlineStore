const Cart = require('../models/cart.model');

// Add Item To Cart
exports.AddItemToCart = async (req, res) => {
	try {
		const result = await Cart.addItemToCart(req.body.variant, req.body.qty, req.customerID);
		if (result === null) {
			return res.json({ status: 200, items: cartItems, subtotal });
		} else {
			return res.json({
				status: 400,
				message: result,
			});
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Edit Cart Item Quantity
exports.EditCartItemQuantity = async (req, res) => {
	req.body.quantity -= 0;
	try {
		if (Number.isNaN(req.body.quantity)) {
			return res.json({
				status: 400,
				message: 'Invalid quantity given',
			});
		} else if (req.body.quantity < 0) {
			return res.json({
				status: 400,
				message: 'Negative quantity given',
			});
		} else {
			const result = await Cart.editCartItemQuantity(
				req.customerID,
				req.params.id,
				req.body.quantity
			);
			if (result === null) {
				return res.json({ status: 200, message: 'Item edited from Cart successfully' });
			} else {
				return res.json({
					status: 400,
					message: result,
				});
			}
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Remove Item From Cart
exports.RemoveItemFromCart = async (req, res) => {
	try {
		await Cart.removeItemFromCart(req.customerID, req.params.id);
		return res.json({ status: 200, message: 'Item removed from Cart successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Transfer Cart Item
exports.TransferCartItem = async (req, res) => {
	try {
		const result = await Cart.transferCartItem(req.customerID, req.params.id);
		if (result === null) {
			return res.json({ status: 200, message: 'Item transfer to Cart successfully' });
		} else {
			return res.json({
				status: 400,
				message: result,
			});
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get Cart Items
exports.GetCartItems = async (req, res) => {
	try {
		const { cartItems, subtotal } = await Cart.getCartItems(req.customerID);
		return res.json({
			status: 200,
			userData: req.userData,
			items: cartItems,
			subtotal,
			error: req.query.error,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
