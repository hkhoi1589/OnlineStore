const router = require('express').Router(); //route
const Item = require('../controllers/item.controller');

// get item by id
router.get('/show/:id', Item.GetById);

module.exports = router;
