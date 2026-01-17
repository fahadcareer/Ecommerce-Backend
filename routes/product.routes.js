const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductDetails, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { protect, authorize } = require('../common/auth.middleware');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), createProduct);

router.route('/:id')
    .get(getProductDetails)
    .patch(protect, authorize('admin'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
