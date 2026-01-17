const orderService = require('../services/order.service');
const apiResponse = require('../common/apiResponse');

const placeOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.user._id, req.body);
        apiResponse(res, 201, 'Order placed successfully', order);
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getUserOrders(req.user._id);
        apiResponse(res, 200, 'Orders retrieved', orders);
    } catch (error) {
        next(error);
    }
};

const getOrderDetails = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
        apiResponse(res, 200, 'Order details retrieved', order);
    } catch (error) {
        next(error);
    }
};

const cancelMyOrder = async (req, res, next) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user._id);
        apiResponse(res, 200, 'Order cancelled successfully', order);
    } catch (error) {
        next(error);
    }
};

// Admin Controllers
const getAllOrdersAdmin = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders(req.query);
        apiResponse(res, 200, 'All orders retrieved', orders);
    } catch (error) {
        next(error);
    }
};

const updateStatusAdmin = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status);
        apiResponse(res, 200, `Order status updated to ${status}`, order);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderDetails,
    cancelMyOrder,
    getAllOrdersAdmin,
    updateStatusAdmin
};
