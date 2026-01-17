const jwt = require('jsonwebtoken');
const User = require('../schema/User');
const ApiError = require('../common/apiError');

/**
 * @desc Protect routes - check for JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return next(new ApiError(401, 'Not authorized, user not found'));
            }

            next();
        } catch (error) {
            console.error(error);
            next(new ApiError(401, 'Not authorized, token failed'));
        }
    }

    if (!token) {
        next(new ApiError(401, 'Not authorized, no token'));
    }
};

/**
 * @desc Role authorization - check if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
