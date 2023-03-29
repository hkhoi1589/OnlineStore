const Admin = require('../models/admin.model');
const Report = require('../models/report.model');

// Get sales
exports.GetSales = async (req, res) => {
	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const quarter = Math.floor(month / 3);
		const quarterReport = await Report.getProductQuarterReport(year, quarter);
		const products = await Report.getProductCounts();
		const sales = await Report.getSalesReport();
		const quarterlySales = await Report.getQuarterlySalesReport();
		return res.json({ status: 200, products, sales, quarterlySales, quarterReport });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get product
exports.GetProducts = async (req, res) => {
	const productId = req.query.id;
	if (!productId) {
		const products = await Report.getProducts();
		return res.json({
			status: 400,
			products,
			message: req.query.error,
			name: req.name,
		});
	}

	try {
		const { productData, variantData } = await Report.getProductData(productId);
		const visitedItems = await Report.getProductVisitedCountReport(productId);
		const orderedItems = await Report.getProductOrderedCountReport(productId);
		const monthlyData = await Report.getProductMonthlyOrdersReport(productId);

		if (productData == null) {
			return res.json({
				status: 400,
				message: 'Invalid product ID',
			});
		}

		visitedItems.forEach((value, index) => {
			if (index === 0) return;
			visitedItems[index].value += visitedItems[index - 1].value;
		});
		orderedItems.forEach((value, index) => {
			if (index === 0) return;
			orderedItems[index].value += orderedItems[index - 1].value;
		});

		return res.json({
			status: 200,
			visitedItems,
			orderedItems,
			productData,
			variantData,
			monthlyData,
			name: req.name,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get category
exports.GetCategories = async (req, res) => {
	try {
		const { categoryData, categoryParents, tree } = await Report.getCategoryTreeReport();
		const topCategoryData = await Report.getTopCategoryLeafNodes();

		return res.json({
			status: 200,
			topCategoryData,
			categoryData,
			categoryParents,
			tree,
			name: req.name,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get time
exports.GetTime = async (req, res) => {
	try {
		const timerange = req.query.daterange;
		if (timerange == null) {
			return res.json({
				status: 400,
				message: req.query.error,
				timerange: null,
				name: req.name,
			});
		}
		const [time1str, time2str] = timerange.split('-');
		if (time1str === undefined || time2str === undefined) {
			return res.json({
				status: 400,
				message: 'Invalid data format',
			});
		}
		const time1 = new Date(time1str);
		const time2 = new Date(time2str);
		const products = await Report.getPopularProductsBetweenDates(time1, time2);

		return res.json({
			status: 200,
			products,
			message: req.query.error,
			timerange,
			name: req.name,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get order
exports.GetOrder = async (req, res) => {
	try {
		const orders = await Report.getOrderReport();
		const orderList = await Report.getAllOrders();

		return res.json({
			status: 200,
			name: req.name,
			orders,
			orderList,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get product
exports.GetProducts = async (req, res) => {
	try {
		const products = await Admin.getAllProducts();
		const categories = await Admin.getAllLeafCategories();

		return res.json({
			status: 200,
			name: req.name,
			error: req.query.error,
			success: req.query.success,
			categories,
			products,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Get variants
exports.GetVariants = async (req, res) => {
	try {
		const products = await Admin.getAllProducts();
		const categories = await Admin.getAllCategories();

		return res.json({
			status: 200,
			name: req.name,
			error: req.query.error,
			success: req.query.success,
			products,
			categories,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add Product
exports.AddProduct = async (req, res) => {
	try {
		await Admin.addProduct(...req.body);
		return res.json({ status: 200, message: 'Product added successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add Variant
exports.AddVariant = async (req, res) => {
	try {
		await Admin.addVariant(...req.body);
		return res.json({ status: 200, message: 'Variant added successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add Category
exports.AddCategory = async (req, res) => {
	try {
		await Admin.addCategory(...req.body);
		return res.json({ status: 200, message: 'Category added successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add Image
exports.AddImage = async (req, res) => {
	try {
		await Admin.addImage(...req.body);
		return res.json({ status: 200, message: 'Image added successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};

// Add Tags
exports.AddTags = async (req, res) => {
	try {
		const ignored = await Admin.addTags(req.body.product, req.body.tags.split(' '));
		if (ignored.length) {
			return res.json({
				status: 400,
				message: `Adding failed. Ignored: ${ignored.join(', ')}`,
			});
		}
		return res.json({ status: 200, message: 'Tags added successfully' });
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
