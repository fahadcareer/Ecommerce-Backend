const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const apiResponse = require('../common/apiResponse');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        apiResponse(res, 201, 'User registered successfully', user);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        apiResponse(res, 200, 'User logged in successfully', user);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        apiResponse(res, 200, 'User profile retrieved', req.user);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add new address
 * @route   POST /api/v1/auth/address
 * @access  Private
 */
const addAddress = async (req, res, next) => {
    try {
        const addresses = await userService.addAddress(req.user._id, req.body);
        apiResponse(res, 200, 'Address added successfully', addresses);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update address
 * @route   PATCH /api/v1/auth/address/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
    try {
        const addresses = await userService.updateAddress(req.user._id, req.params.id, req.body);
        apiResponse(res, 200, 'Address updated successfully', addresses);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/auth/address/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
    try {
        const addresses = await userService.deleteAddress(req.user._id, req.params.id);
        apiResponse(res, 200, 'Address deleted successfully', addresses);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    addAddress,
    updateAddress,
    deleteAddress
};
