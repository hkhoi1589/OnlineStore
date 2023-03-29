const User = require('../models/user.model');
const Order = require('../models/order.model');

// Get Profile
exports.GetProfile = async (req, res) => {
	try {
		/*
		if (req.customer.user == null) {
			res.redirect('/');
			return;
		}
        */
		const recentOrders = await Order.getRecentOrders(req.customerID);
		const recentProducts = await User.recentProducts(req.customerID);
		const userInfo = await User.userInfo(req.customerID);
		return res.json({
			status: 200,
			userData: req.userData,
			recentProducts,
			userInfo,
			recentOrders,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
