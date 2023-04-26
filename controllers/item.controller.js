const Product = require('../models/product.model');
const ProductImage = require('../models/productimage.model');

// Get all
exports.GetById = async (req, res) => {
	const { id } = req.params;
	try {
		const product = await Product.getProduct(id);
		const images = await ProductImage.getImages(id);
		if (images.length === 1) images.push(images[0]);

		const variantsData = await Product.getVariants(id);

		const releatedProducts = await Product.getRelatedProducts(id, 9);

		return res.json({
			status: 200,
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
		console.log(error.message);
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
