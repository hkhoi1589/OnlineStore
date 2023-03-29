const Category = require('../models/category.model');
const Product = require('../models/product.model');

// Get all
exports.GetAll = async (req, res) => {
	try {
		if (req.query.query === undefined && req.query.category === undefined) {
			const categories = await Category.getChildren(req, res, req.query.category);
			const productDetails = await Product.getProductsFromAllCategories();

			return res.json({
				status: 200,
				userData: req.userData,
				products: productDetails.result,
				categories,
				categorytitle: null,
				parentid: null,
				topprice: productDetails.topprice,
				title: 'Browse Products',
			});
		} else if (req.query.query === undefined) {
			const categories = await Category.getChildren(req, res, req.query.category);
			const categoryDetails = await Category.getDetails(req, res, req.query.category);
			const productDetails = await Product.getProductsFromCategory(
				req,
				res,
				req.query.category
			);

			return res.json({
				status: 200,
				userData: req.userData,
				products: productDetails.result,
				categories,
				categorytitle: categoryDetails.title,
				parentid: categoryDetails.parent_id,
				topprice: productDetails.topprice,
				title: `Search Results for ${categoryDetails.title}`,
			});
		} else if (req.query.category === undefined) {
			const categories = await Category.getChildren(req, res, req.query.category);
			const productDetails = await Product.getProductsFromQuery(req, res, req.query.query);

			return res.json({
				status: 200,
				userData: req.userData,
				products: productDetails.result,
				categories,
				categorytitle: null,
				parentid: null,
				topprice: productDetails.topprice,
				title: `Search Results for ${req.query.query}`,
			});
		} else {
			return res.json({
				status: 400,
				message: 'Category or query both specified',
			});
		}
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
