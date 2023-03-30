const authRoute = require('./auth.routes');
const User = require('../models/user.model');
const { verifyKey, isEmpty } = require('../helpers');

// kiem tra token tu cac request den server
const verifyToken = async (req, res, next) => {
	const token = req.body.token || req.query.token || req.headers['authorization'];
	if (!token) {
		return res.status(403).send('A token is required for authentication');
	}
	const decoded = verifyKey(token, process.env.ACCESS_TOKEN_SECRET);
	if (!isEmpty(decoded)) {
		const userType = await User.userType(req.customerID);
		req.userData = { loggedIn: true, userType, cartItems: 0 };
	} else {
		req.userData = { loggedIn: false, userType: 'guest', cartItems: 0 };
	}

	// Notice: Luu cart vao session o client khi lam den chuc nang Order-Cart
	next();
};

// RestFul Api
function routes(app) {
	app.use('/api/auth', authRoute);
	//app.use('/api/user', verifyToken, userRoute);
	//app.use('/api/post', verifyToken, postRoute);
	app.use('/', (req, res) => res.send('Home Page'));
}

module.exports = routes;
