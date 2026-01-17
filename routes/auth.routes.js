const express = require('express');
const router = express.Router();
const { register, login, getMe, addAddress, updateAddress, deleteAddress } = require('../controllers/auth.controller');
const { protect } = require('../common/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Address Management
router.post('/address', protect, addAddress);
router.patch('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;
