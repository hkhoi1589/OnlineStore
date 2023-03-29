const router = require('express').Router(); //route
const Report = require('../models/report.model');
const Admin = require('../controllers/admin.controller');

// Check if Admin
const adminAuthChecker = async (req, res, next) => {
	req.name = 'Guest';
	const { permission, name } = await Report.reportViewPermissionChecker(req.customerID);
	if (permission) {
		req.name = name;
		next();
	}
};

router.use(adminAuthChecker);

// get sales
router.get('/sales', Admin.GetSales);

// get product
router.get('/product', Admin.GetProducts);

// get category
router.get('/category', Admin.GetCategories);

// get time
router.get('/time', Admin.GetTime);

// get order
router.get('/order', Admin.GetOrder);

// get product
router.get('/get-product', Admin.GetProducts);

// get variants
router.get('/get-variants', Admin.GetVariants);

// add products
router.post('/add/product/', Admin.AddProduct);

// add variant
router.post('/add/variant/', Admin.AddVariant);

// add category
router.post('/add/category/', Admin.AddCategory);

// add image
router.post('/add/image/', Admin.AddImage);

// add tags
router.post('/add/tags/', Admin.AddTags);

module.exports = router;
