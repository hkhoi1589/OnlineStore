const router = require('express').Router(); //route
const City = require('../controllers/city.controller');

// Get all cities
router.get('/', City.GetCities);

module.exports = router;
