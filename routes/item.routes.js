const router = require('express').Router(); //route
const Item = require('../controllers/item.controller');

// get
router.get('/', Item.GetAll);

module.exports = router;
