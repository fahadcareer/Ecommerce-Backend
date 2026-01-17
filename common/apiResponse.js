/**
 * @desc    Response formatter for consistent API responses
 */
const apiResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        data,
    });
};

module.exports = apiResponse;
