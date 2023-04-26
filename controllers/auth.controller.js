const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const { createAccessToken, createRefreshToken, getTokenExp } = require('../helpers');

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
			avatar,
		} = req.body;

		const success = await User.createUser(
			email,
			firstName,
			lastName,
			addressLine1,
			addressLine2,
			city,
			postalCode,
			birthday,
			password,
			telephoneNumber,
			avatar
		);

		if (success) {
			const user = await User.FindEmail(email);
			const access_token = createAccessToken({ id: user.customer_id });
			const refresh_token = createRefreshToken({ id: user.customer_id });
			const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

			return res.json({
				status: 200,
				access_token,
				refresh_token,
				expires_at,
				name: user.name,
				avatar: user.avatar,
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

exports.FindEmail = async (req, res) => {
	try {
		const { email } = req.body;

		// Find user
		const user = await User.FindEmail(email);
		if (!user) return res.json({ status: 404, message: 'This user does not exist.' });

		const access_token = createAccessToken({ id: user.customer_id });
		const refresh_token = createRefreshToken({ id: user.customer_id });
		const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

		return res.json({
			status: 200,
			access_token,
			refresh_token,
			expires_at,
			name: user.name,
			avatar: user.avatar,
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

		const access_token = createAccessToken({ id: validPassword.customer_id });
		const refresh_token = createRefreshToken({ id: validPassword.customer_id });
		const expires_at = getTokenExp(); // gia han access_token 1 days hien tai
		delete validPassword.customer_id;

		return res.json({
			status: 200,
			access_token,
			refresh_token,
			expires_at,
			name: validPassword.name,
			avatar: validPassword.avatar,
		});
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

			const user = await User.UserInfo(result.id);

			if (!user) return res.json({ status: 404, message: 'This user does not exist.' });

			const access_token = createAccessToken({ id: user.customer_id });
			const refresh_token = createRefreshToken({ id: user.customer_id });
			const expires_at = getTokenExp(); // gia han access_token 1 days hien tai

			return res.json({
				status: 200,
				access_token,
				refresh_token,
				expires_at,
				name: user.name,
				avatar: user.avatar,
			});
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
