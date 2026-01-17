const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true // One cart per user
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity cannot be less than 1'],
                    default: 1
                },
                size: {
                    type: String,
                    default: 'Standard'
                },
                price: {
                    type: Number,
                    required: true // Store price at time of adding to cart
                }
            }
        ],
        totalAmount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Indexing for performance (user is already indexed via unique: true)

module.exports = mongoose.model('Cart', cartSchema);
