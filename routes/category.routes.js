const router = require('express').Router(); //route
const Category = require('../controllers/category.controller');

// get
router.get('/', Category.GetAll);

module.exports = router;
