const Product = require('../models/product.model');

// getRecentProducts
exports.GetRecentProducts = async (req, res) => {
	try {
		const products = await Product.getRecentProducts(18);
		return res.json({ status: 200, products });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
