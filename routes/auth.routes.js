const router = require('express').Router(); //route
const Auth = require('../controllers/auth.controller');

// register
router.post('/register', Auth.Register);

// find email
router.post('/find-email', Auth.FindEmail);

// login
router.post('/login', Auth.Login);

// refresh token
router.post('/refresh-token', Auth.GenerateAccessToken);

module.exports = router;
