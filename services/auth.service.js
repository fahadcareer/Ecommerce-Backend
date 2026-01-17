const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../schema/User');
const ApiError = require('../common/apiError');

/**
 * @desc Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc Register user service
 */
const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user'
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new ApiError(400, 'Invalid user data');
    }
};

/**
 * @desc Login user service
 */
const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new ApiError(401, 'Invalid email or password');
    }
};

module.exports = {
    registerUser,
    loginUser,
};
