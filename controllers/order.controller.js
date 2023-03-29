const UUID = require('uuid/dist/v4');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

// Get order by id
exports.GetOrderById = async (req, res) => {
	if (!req.query.id) {
		return res.json({
			status: 404,
			message: 'Unspecified order id',
		});
	}

	try {
		/* check for user permission to view order history */
		const permission = await Order.orderHistoryPermissionChecker(req);

		/*
		if (!permission) {
			res.redirect('/');
			return;
		}
		*/

		/* Create an order history object with all the information needed for order history page */
		const orderHistoryObj = await Order.getOrderHistory(req.params.orderId);

		return res.json({
			status: 200,
			userData: req.userData,
			show_thanks: false,
			orderHistoryObj,
		});
	} catch (err) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add order
exports.AddOrder = async (req, res) => {
	/* Temporary adapter to map passed variables to suitable values */
	if (req.body.delivery_method === 'deliver') {
		req.body.delivery_method = 'home_delivery';
	} else {
		req.body.delivery_method = 'store_pickup';
	}
	if (req.body.payment_method !== 'card') {
		req.body.payment_method = 'cash';
	}

	/* Check if all the items are avaiable in stocks */
	const result = await Cart.checkStock(req.customerID);

	if (result == null) {
		try {
			/* Get details needed to make and order(subtotal and delivery_charge) */
			const dataObj = await Order.getOrderDetails(req);

			/* In case user refresh the order confirmation page, redirects him to home */
			/*
			if (dataObj.subtotal === 0) {
				res.redirect('/');
				return;
			}
			*/

			let totalCost;

			/* Define total based on the delivery type */
			if (req.body.delivery_method === 'home_delivery') {
				totalCost = (
					parseFloat(dataObj.subtotal) + parseFloat(dataObj.delivery_charge)
				).toFixed(2);
			} else {
				totalCost = dataObj.subtotal;
			}

			/* Create the order */
			const orderId = UUID();
			await Order.createOrder(req.customerID, req.body, orderId, totalCost);

			return res.json({
				status: 200,
			});
		} catch (err) {
			return res.status(500).send({ message: error.message, status: 500 });
		}
	} else {
		return res.json({
			status: 400,
			message: result,
		});
	}
};
