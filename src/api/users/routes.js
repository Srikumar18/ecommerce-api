const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const { findUser } = require('./controller');
const router = express.Router();


router.get('/:id', findUser);

module.exports = router;