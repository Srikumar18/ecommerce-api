const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const adminMiddleware = require('../../middleware/admin-middleware');
const { findUser, updateUser, deleteUser, listUsers } = require('./controller');
const router = express.Router();


router.get('/:id', authMiddleware, findUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.get('/', authMiddleware, adminMiddleware, listUsers);

module.exports = router;