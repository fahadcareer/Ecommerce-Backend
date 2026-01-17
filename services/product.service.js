const Product = require('../schema/Product');
const Category = require('../schema/Category');
const ApiError = require('../common/apiError');
const mongoose = require('mongoose');
const slugify = require('../common/slugify');

const createProduct = async (productData) => {
    const slug = slugify(productData.name);
    productData.slug = slug;
    return await Product.create(productData);
};

const getAllProducts = async (query) => {
    const { category, keyword, minPrice, maxPrice, page = 1, limit = 10, sort } = query;

    const queryObject = {};

    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            queryObject.category = category;
        } else {
            // Find category by slug
            const foundCategory = await Category.findOne({ slug: category });
            if (foundCategory) {
                queryObject.category = foundCategory._id;
            } else {
                // If slug doesn't exist, return no products for this query
                queryObject.category = new mongoose.Types.ObjectId();
            }
        }
    }
    if (keyword) {
        queryObject.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }
    if (minPrice || maxPrice) {
        queryObject.price = {};
        if (minPrice) queryObject.price.$gte = Number(minPrice);
        if (maxPrice) queryObject.price.$lte = Number(maxPrice);
    }

    let result = Product.find(queryObject).populate('category', 'name');

    // Sorting
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('-createdAt');
    }

    // Pagination
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    const products = await result;
    const totalProducts = await Product.countDocuments(queryObject);
    const totalPages = Math.ceil(totalProducts / limit);

    return { products, totalProducts, totalPages, currentPage: Number(page) };
};

const getProductById = async (id) => {
    const product = await Product.findById(id).populate('category', 'name');
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
};

const updateProduct = async (id, updateData) => {
    if (updateData.name) {
        updateData.slug = slugify(updateData.name);
    }
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
