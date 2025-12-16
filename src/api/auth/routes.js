const express = require('express')
const cookieParser = require('cookie-parser');
const {login, register, refreshToken, logout } = require('./controller');
const authMiddleware = require('../../middleware/auth-middleware');

const router = express.Router();
router.use(cookieParser());

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/reset-password', authMiddleware, resetPassword);

module.exports = router;