const Category = require('../schema/Category');
const ApiError = require('../common/apiError');
const slugify = require('../common/slugify');

const createCategory = async (categoryData) => {
    const { name, description, image } = categoryData;
    const slug = slugify(name);

    const existing = await Category.findOne({ slug });
    if (existing) throw new ApiError(400, 'Category already exists');

    const count = await Category.countDocuments();

    return await Category.create({ name: name.trim(), description, image, slug, order: count });
};

const getAllCategories = async () => {
    return await Category.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                image: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                order: 1,
                totalItems: { $size: '$products' }
            }
        },
        { $sort: { order: 1, createdAt: -1 } }
    ]);
};

const updateCategory = async (id, updateData) => {
    if (updateData.name) {
        updateData.slug = slugify(updateData.name);
    }
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!category) throw new ApiError(404, 'Category not found');
    return category;
};

const deleteCategory = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new ApiError(404, 'Category not found');
    return category;
};

const updateCategoryOrder = async (orders) => {
    // orders = [{ id: '...', order: 0 }, { id: '...', order: 1 }]
    const bulkOps = orders.map(item => ({
        updateOne: {
            filter: { _id: item.id },
            update: { order: item.order }
        }
    }));
    return await Category.bulkWrite(bulkOps);
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    updateCategoryOrder
};
