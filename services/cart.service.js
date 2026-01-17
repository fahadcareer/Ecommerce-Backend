const Cart = require('../schema/Cart');
const Product = require('../schema/Product');
const ApiError = require('../common/apiError');

/**
 * @desc    Get user cart
 */
const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images stock slug sizes');

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
        return cart;
    }

    // Check for orphaned items (where product was deleted)
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product !== null);

    if (cart.items.length !== originalLength) {
        // Recalculate total if items were removed
        cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        await cart.save();
    }

    return cart;
};

const addToCart = async (userId, productId, quantity, size) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const finalSize = size || 'Standard';
    let sizeInfo = null;

    // If product has defined sizes, validate against them
    if (product.sizes && product.sizes.length > 0) {
        sizeInfo = product.sizes.find(s => s.size === finalSize);
        if (!sizeInfo) {
            throw new ApiError(400, `Size ${finalSize} is not available for this product`);
        }
        if (sizeInfo.stock < quantity) {
            throw new ApiError(400, `Only ${sizeInfo.stock} items in stock for size ${finalSize}`);
        }
    } else {
        // Fallback for products without sizes array (legacy)
        if (product.stock < quantity) {
            throw new ApiError(400, `Only ${product.stock} items in stock`);
        }
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    // Check if product with same size already exists in cart
    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId && item.size === finalSize
    );

    if (itemIndex > -1) {
        // Update existing item quantity
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = product.price;

        // Re-check stock after update if sizes exist
        if (sizeInfo && sizeInfo.stock < cart.items[itemIndex].quantity) {
            cart.items[itemIndex].quantity = sizeInfo.stock;
        } else if (!sizeInfo && product.stock < cart.items[itemIndex].quantity) {
            cart.items[itemIndex].quantity = product.stock;
        }
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            size: finalSize,
            price: product.price
        });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    await cart.save();
    return cart.populate('items.product', 'name price images stock slug sizes');
};

/**
 * @desc    Update item quantity
 */
const updateCartItem = async (userId, productId, size, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'Cart not found');

    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId && item.size === size
    );
    if (itemIndex === -1) throw new ApiError(404, 'Item not found in cart');

    const product = await Product.findById(productId);
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) throw new ApiError(400, 'Size not available');

    if (sizeInfo.stock < quantity) {
        throw new ApiError(400, `Only ${sizeInfo.stock} items in stock for size ${size}`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    await cart.save();
    return cart.populate('items.product', 'name price images stock slug sizes');
};

/**
 * @desc    Remove item from cart
 */
const removeFromCart = async (userId, productId, size) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter(item =>
        !(item.product.toString() === productId && item.size === size)
    );

    cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    await cart.save();
    return cart.populate('items.product', 'name price images stock slug sizes');
};

/**
 * @desc    Clear cart
 */
const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
    }
    return cart;
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
