const express = require('express')
const router = express.Router();
const {login, register, findUser} = require('./controller');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', findUser);

module.exports = router;