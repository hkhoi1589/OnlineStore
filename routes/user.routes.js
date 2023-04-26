const router = require('express').Router(); //route
const User = require('../controllers/user.controller');

// Get profile
router.get('/profile', User.GetProfile);

// Update profile
router.put('/update-user', User.UpdateProfile);

module.exports = router;
