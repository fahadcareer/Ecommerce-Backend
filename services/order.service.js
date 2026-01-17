const mongoose = require('mongoose');
const Order = require('../schema/Order');
const Cart = require('../schema/Cart');
const Product = require('../schema/Product');
const ApiError = require('../common/apiError');

/**
 * @desc    Place a new order
 */
const createOrder = async (userId, shippingData) => {
    const { shippingAddress, paymentMethod, shippingMethod } = shippingData;

    // 1. Get user cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Your cart is empty');
    }

    const orderItems = [];
    let calculatedItemsPrice = 0;

    // 2. Validate stock and prepare order items
    for (const item of cart.items) {
        // ATOMIC CHECK-AND-UPDATE: Subtract only if current stock >= quantity
        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: item.product._id,
                'sizes.size': item.size,
                'sizes.stock': { $gte: item.quantity }
            },
            {
                $inc: {
                    'sizes.$.stock': -item.quantity,
                    stock: -item.quantity
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            throw new ApiError(400, `Stock exhausted for ${item.product.name} (Size: ${item.size})`);
        }

        orderItems.push({
            name: item.product.name,
            quantity: item.quantity,
            image: item.product.images[0]?.url || 'default.jpg',
            price: item.product.price, // Uses current DB price for safety
            product: item.product._id,
            size: item.size
        });

        calculatedItemsPrice += (item.product.price * item.quantity);
    }

    // 3. Calculation logic
    const itemsPrice = calculatedItemsPrice;
    const shippingPrice = shippingMethod === 'prepaid' ? 30 : 0;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // 4. Create order
    const order = await Order.create({
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: paymentMethod !== 'CashOnDelivery',
        status: 'pending'
    });

    // 5. Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
};

/**
 * @desc    Get order details
 */
const getOrderById = async (orderId, userId, userRole) => {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.user._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, 'Not authorized to view this order');
    }

    return order;
};

/**
 * @desc    Get user's orders
 */
const getUserOrders = async (userId) => {
    return await Order.find({ user: userId }).sort('-createdAt');
};

/**
 * @desc    Get all orders (Admin)
 */
const getAllOrders = async (query = {}) => {
    const { status, page = 1, limit = 10 } = query;
    const queryObject = {};
    if (status) queryObject.status = status;

    return await Order.find(queryObject)
        .populate('user', 'name email')
        .populate('orderItems.product')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit);
};

/**
 * @desc    Update order status (Admin)
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');

    order.status = status;
    if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.isPaid = true;
        order.paidAt = Date.now();
    }

    await order.save();
    return order;
};

/**
 * @desc    Cancel order (with stock restoration)
 */
const cancelOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Not authorized to cancel this order');
    }

    if (order.status !== 'pending') {
        throw new ApiError(400, `Cannot cancel order in ${order.status} state`);
    }

    // Restore stock atomically
    for (const item of order.orderItems) {
        await Product.updateOne(
            { _id: item.product, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': item.quantity, stock: item.quantity } }
        );
    }

    order.status = 'cancelled';
    await order.save();
    return order;
};

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
};
