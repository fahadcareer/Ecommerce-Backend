const apiResponse = require('./apiResponse');

/**
 * @desc    Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!statusCode) {
        statusCode = 500;
    }

    // In production, don't leak full error details unless marked as operational
    const responseMessage = process.env.NODE_ENV === 'production' && !err.isOperational
        ? 'Internal Server Error'
        : message;

    console.error(`[ERROR] ${statusCode} - ${message}`);
    if (err.stack && process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    return apiResponse(res, statusCode, responseMessage);
};

module.exports = errorHandler;
