const cartService = require('../services/cart.service');
const apiResponse = require('../common/apiResponse');

/**
 * @desc    Get user cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
const getMyCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user._id);
        apiResponse(res, 200, 'Cart retrieved', cart);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
const addItem = async (req, res, next) => {
    try {
        const { productId, quantity, size } = req.body;
        const cart = await cartService.addToCart(req.user._id, productId, quantity || 1, size);
        apiResponse(res, 200, 'Item added to cart', cart);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:productId
 * @access  Private
 */
const updateItem = async (req, res, next) => {
    try {
        const { quantity, size } = req.body;
        const cart = await cartService.updateCartItem(req.user._id, req.params.productId, size, quantity);
        apiResponse(res, 200, 'Cart updated', cart);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/:productId
 * @access  Private
 */
const deleteItem = async (req, res, next) => {
    try {
        const { size } = req.query;
        const cart = await cartService.removeFromCart(req.user._id, req.params.productId, size);
        apiResponse(res, 200, 'Item removed from cart', cart);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyCart,
    addItem,
    updateItem,
    deleteItem
};
