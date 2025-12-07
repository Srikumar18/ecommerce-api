const express = require('express');
const router = express.Router();
const { findUser } = require('./controller');

router.get('/:id', findUser);

module.exports = router;