const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters']
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            default: 0
        },
        originalPrice: {
            type: Number,
            default: 0
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product must belong to a category']
        },
        sizes: [
            {
                size: { type: String, required: true },
                stock: { type: Number, required: true, default: 0 }
            }
        ],
        stock: {
            type: Number,
            required: [true, 'Total stock count is required'],
            default: 0
        },
        images: [
            {
                url: { type: String, required: true },
                isMain: { type: Boolean, default: false }
            }
        ],
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 }
        },
        sku: {
            type: String,
            required: true,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        details: [
            {
                label: { type: String },
                value: { type: String }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexing for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
