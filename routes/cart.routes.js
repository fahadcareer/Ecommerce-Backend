const express = require('express');
const router = express.Router();
const { getMyCart, addItem, updateItem, deleteItem } = require('../controllers/cart.controller');
const { protect } = require('../common/auth.middleware');

// All cart routes are protected
router.use(protect);

router.route('/')
    .get(getMyCart)
    .post(addItem);

router.route('/:productId')
    .put(updateItem)
    .delete(deleteItem);

module.exports = router;
