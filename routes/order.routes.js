const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getMyOrders,
    getOrderDetails,
    cancelMyOrder,
    getAllOrdersAdmin,
    updateStatusAdmin
} = require('../controllers/order.controller');
const { protect, authorize } = require('../common/auth.middleware');

// All order routes require login
router.use(protect);

// User Routes
router.route('/')
    .get(getMyOrders)
    .post(placeOrder);

router.route('/:id')
    .get(getOrderDetails)
    .put(cancelMyOrder); // User can cancel their own pending order

// Admin Routes
router.route('/admin/all')
    .get(authorize('admin'), getAllOrdersAdmin);

router.route('/admin/:id/status')
    .patch(authorize('admin'), updateStatusAdmin);

module.exports = router;
