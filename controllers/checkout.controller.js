const Cart = require('../models/cart.model');
const Order = require('../models/order.model');

// Get all
exports.GetAll = async (req, res) => {
	try {
		const dataObj = Order.getOrderDetails(req);

		/* After order confirmation user redirect back to check out and try to check out again */
		/*
		if (dataObj.subtotal === 0) {
			res.redirect('/');
		}
		*/

		const result = await Cart.checkStock(req.customerID);

		if (result == null) {
			const proceedCheckOutObj = await Cart.proceedCheckOut(
				req.customerID,
				req.customer.user
			);

			return res.json({
				status: 200,
				userData: req.userData,
				proceedCheckOutObj,
				error: req.query.error,
			});
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
