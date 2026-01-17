const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const errorHandler = require('./common/errorHandler');
const apiResponse = require('./common/apiResponse');
const ApiError = require('./common/apiError');
require('dotenv').config();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to MongoDB
connectDB();

// --- Middleware ---

// 1. Security Headers
app.use(helmet());

// 2. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased limit for development/busy sessions
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => process.env.NODE_ENV !== 'production', // Skip rate limiting in development
});
app.use(limiter);

// Enable CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10kb' })); // Body limit

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// 3. Data Sanitization against NoSQL query injection
// Custom middleware for Express 5 compatibility (modifies objects in-place)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
});

// --- API Routes ---
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/settings', require('./routes/settings.routes'));
app.use('/api/v1/bulk-upload', require('./routes/bulkUpload.routes'));

// Health Check Route
app.get('/health', (req, res) => {
    apiResponse(res, 200, 'Server is healthy and running');
});

// Example route placeholder
// app.use('/api/v1/auth', require('./routes/auth.routes'));

// --- Error Handling ---
// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(new ApiError(404, 'Route not found'));
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`🛠️  Environment: ${process.env.NODE_ENV}`);

    // Check for critical production config
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
        console.warn(`\n[WARNING] FRONTEND_URL is not set! Custom CORS options will fail.`);
        console.warn(`Please set FRONTEND_URL in your environment variables.\n`);
    }

    console.log(`-----------------------------------------`);
});

module.exports = app;
