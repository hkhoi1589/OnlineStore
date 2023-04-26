const Category = require('../models/category.model');
const Product = require('../models/product.model');

// Get all category
exports.GetAllCategory = async (req, res) => {
	let { page, category, order, min, max } = req.query;
	page = +page;
	min = +min;
	max = +max;

	const numPerPage = 9;
	const skip = (page - 1) * numPerPage;
	let categories, products, productDetails;

	//console.log({ page, category, order, min, max });

	try {
		if (!category) {
			[categories, products, productDetails] = await Promise.all([
				Category.getChildren(),
				Product.getProductsFromAllCategories(min, max),
				Product.getProductsFromAllCategoriesPerPage(numPerPage, skip, order, min, max),
			]);
		} else {
			[categories, products, productDetails] = await Promise.all([
				Category.getChildren(),
				Product.getProductsFromCategories(category, min, max),
				Product.getProductsFromCategoriesPerPage(
					numPerPage,
					skip,
					category,
					order,
					min,
					max
				),
			]);
		}

		return res.json({
			status: 200,
			count: products.result.length,
			products: productDetails.result,
			categories,
			title: 'Browse Products',
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Search
exports.Search = async (req, res) => {
	const { query } = req.query;
	//console.log(query);

	try {
		const productDetails = await Product.getProductsFromQuery(query);

		return res.json({
			status: 200,
			products: productDetails.result,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
