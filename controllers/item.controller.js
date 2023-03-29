const Product = require('../models/product.model');
const ProductImage = require('../models/productimage.model');

// Get all
exports.GetAll = async (req, res) => {
	try {
		const product = await Product.getProduct(req, res, req.params.id);
		const images = await ProductImage.getImages(req, res, req.params.id);
		if (images.length === 1) images.push(images[0]);

		const variantsData = await Product.getVariants(req, res, req.params.id);

		const releatedProducts = await Product.getRelatedProducts(req, res, req.params.id, 9);

		return res.json({
			status: 200,
			userData: req.userData,
			name: product.title,
			description: product.description,
			weight: product.weight_kilos,
			brand: product.brand,
			images,
			attributes: product.attributes,
			variants: variantsData.result,
			variant_attributes: variantsData.attributes,
			related: releatedProducts,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
