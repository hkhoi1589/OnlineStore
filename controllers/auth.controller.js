const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const {
	handlePassword,
	comparePassword,
	createAccessToken,
	createRefreshToken,
	getTokenExp,
} = require('../helpers');

exports.Register = async (req, res) => {
	try {
		const {
			email,
			password,
			firstName,
			lastName,
			addressLine1,
			addressLine2,
			city,
			postalCode,
			telephoneNumber,
			birthday,
		} = req.body;

		// Hash password
		if (password) password = await handlePassword(password);

		const bdayParts = birthday.split('/');
		const birthdayParsed = new Date(
			parseInt(bdayParts[2], 10),
			parseInt(bdayParts[1], 10) - 1,
			parseInt(bdayParts[0], 10)
		);
		const success = await User.createUser(
			req.customerID,
			email,
			firstName,
			lastName,
			addressLine1,
			addressLine2,
			city,
			postalCode,
			password,
			telephoneNumber,
			birthdayParsed
		);

		const access_token = createAccessToken({ id: req.customerID });
		const refresh_token = createRefreshToken({ id: req.customerID });
		const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

		if (success) {
			req.customer.user = true;
			return res.json({
				status: 200,
				access_token,
				refresh_token,
				expires_at,
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

// chua xong
exports.FindEmail = async (req, res) => {
	try {
		const { email } = req.body;

		// Find user
		const user = await User.findOne({ email }).lean();
		if (!user) return res.json({ status: 404, message: 'This email does not exist.' });

		const access_token = createAccessToken({ id: user._id });
		const refresh_token = createRefreshToken({ id: user._id });
		const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

		return res.json({
			status: 200,
			access_token,
			refresh_token,
			expires_at,
			user: {
				...user,
				password: '',
			},
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

exports.Login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check password
		const validPassword = await User.validatePassword(email, password);
		if (!validPassword) return res.json({ status: 400, message: 'Email or password invalid!' });

		const assigned = await User.assignCustomerId(req.customerID, email);
		if (assigned) {
			req.customer.user = true;
			const access_token = createAccessToken({ id: req.customerID });
			const refresh_token = createRefreshToken({ id: req.customerID });
			const expires_at = getTokenExp(); // gia han access_token 1 days hien tai
			const accountType = await User.userType(req.customerID);
			return res.json({
				status: 200,
				accountType,
				access_token,
				refresh_token,
				expires_at,
			});
		} else {
			return res.json({
				status: 404,
				message: 'Something went wrong',
			});
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// chua xong
exports.GenerateAccessToken = async (req, res) => {
	try {
		const { refreshtoken: rf_token } = req.body;
		if (!rf_token) return res.json({ status: 400, message: 'Please login now.' });

		jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
			if (err) return res.json({ status: 400, message: 'Please login now.' });

			const user = await User.findById(result.id).select('-password');

			if (!user) return res.json({ status: 404, message: 'This user does not exist.' });

			const access_token = createAccessToken({ id: user._id });
			const refresh_token = createRefreshToken({ id: user._id });
			const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

			return res.json({
				status: 200,
				access_token,
				refresh_token,
				expires_at,
			});
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
