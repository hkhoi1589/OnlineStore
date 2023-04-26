const router = require('express').Router(); //route
const Category = require('../controllers/category.controller');

// Get all category
router.get('/', Category.GetAllCategory);

// search category
router.get('/search', Category.Search);

module.exports = router;
