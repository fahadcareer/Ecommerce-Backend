const categoryService = require('../services/category.service');
const apiResponse = require('../common/apiResponse');

const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        apiResponse(res, 201, 'Category created successfully', category);
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        apiResponse(res, 200, 'Categories retrieved', categories);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        apiResponse(res, 200, 'Category updated successfully', category);
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        apiResponse(res, 200, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

const updateCategoryOrder = async (req, res, next) => {
    try {
        await categoryService.updateCategoryOrder(req.body.orders);
        apiResponse(res, 200, 'Category order updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    updateCategoryOrder
};
