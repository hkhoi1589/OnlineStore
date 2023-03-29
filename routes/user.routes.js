const router = require('express').Router(); //route
const User = require('../controllers/user.controller');

// Get profile
router.get('/profile', User.GetProfile);

module.exports = router;
