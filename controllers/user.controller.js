const User = require('../models/user.model');
const Order = require('../models/order.model');
const { getUserId, handlePassword } = require('../helpers');

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

// Update Profile
exports.UpdateProfile = async (req, res) => {
	try {
		let success;
		const customerID = getUserId(req);
		const {
			email,
			firstName,
			lastName,
			addr_line1,
			addr_line2,
			city,
			postcode,
			birthday,
			password,
			telephoneNumber,
			avatar,
		} = req.body;

		const bdayParts = birthday.split('/');

		const birthdayParsed = new Date(
			parseInt(bdayParts[2], 10),
			parseInt(bdayParts[1], 10) - 1,
			parseInt(bdayParts[0], 10)
		);

		// Hash password
		if (password !== '') {
			// Hash password
			const hashedPassword = await handlePassword(password);

			// find and update
			success = await User.updateUser(
				customerID,
				email,
				firstName,
				lastName,
				addr_line1,
				addr_line2,
				city,
				postcode,
				birthdayParsed,
				hashedPassword,
				telephoneNumber,
				avatar
			);
		} else {
			// find and update
			success = await User.updateUserWithoutPass(
				customerID,
				email,
				firstName,
				lastName,
				addr_line1,
				addr_line2,
				city,
				postcode,
				birthdayParsed,
				telephoneNumber,
				avatar
			);
		}

		if (success) {
			const user = await User.FindEmail(email);
			delete user.customer_id;

			return res.json({
				status: 200,
				user,
			});
		} else {
			return res.json({
				status: 404,
			});
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
