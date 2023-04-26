const City = require('../models/city.model');

// Get all cities
exports.GetCities = async (req, res) => {
	try {
		const cities = await City.getAllCities();
		return res.json({
			status: 200,
			cities,
		});
	} catch (error) {
		return res.status(500).send({ message: error.message, status: 500 });
	}
};
