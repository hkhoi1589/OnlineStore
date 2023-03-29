const Product = require('../models/product.model');

// getRecentProducts
exports.GetRecentProducts = async (req, res) => {
	try {
		const products = await Product.getRecentProducts(req, res, 18);
		return res.json({ status: 200, userData: req.userData, products });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
