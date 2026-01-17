const productService = require('../services/product.service');
const apiResponse = require('../common/apiResponse');

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        apiResponse(res, 201, 'Product created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const data = await productService.getAllProducts(req.query);
        apiResponse(res, 200, 'Products retrieved', data);
    } catch (error) {
        next(error);
    }
};

const getProductDetails = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        apiResponse(res, 200, 'Product details retrieved', product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        apiResponse(res, 200, 'Product updated successfully', product);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        apiResponse(res, 200, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct
};
