const express = require('express')
const cookieParser = require('cookie-parser');
const {login, register, refreshToken, logout } = require('./controller');

const router = express.Router();
router.use(cookieParser());

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;