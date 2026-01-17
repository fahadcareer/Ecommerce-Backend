const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect, authorize } = require('../common/auth.middleware');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), createCategory);

router.route('/:id')
    .patch(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

router.put('/reorder', protect, authorize('admin'), require('../controllers/category.controller').updateCategoryOrder);

module.exports = router;
