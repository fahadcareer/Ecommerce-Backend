const Product = require('../schema/Product');
const Category = require('../schema/Category');
const xlsx = require('xlsx');
const slugify = require('../common/slugify');

// Generate Excel template for bulk upload
const generateTemplate = async (req, res) => {
    try {
        // Fetch all categories to show in template
        const categories = await Category.find({});

        // Create sample data with instructions
        const templateData = [
            {
                'Product Name': 'Example Shirt',
                'Description': 'A comfortable cotton shirt',
                'Price': 750,
                'Original Price': 999,
                'Category Slug': 'shirts',
                'SKU': 'SHIRT-001',
                'Sizes': 'S:15, M:20, L:15',
                'Image URLs': 'https://example.com/image1.jpg, https://example.com/image2.jpg',
                'Specifications': 'Fabric:100% Cotton, Care:Machine Wash'
            }
        ];

        // Create worksheet
        const ws = xlsx.utils.json_to_sheet(templateData);

        // Add category reference sheet
        const categoryData = categories.map(cat => ({
            'Category Name': cat.name,
            'Category Slug': cat.slug
        }));
        const wsCat = xlsx.utils.json_to_sheet(categoryData);

        // Create workbook with multiple sheets
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Product Template');
        xlsx.utils.book_append_sheet(wb, wsCat, 'Available Categories');

        // Generate buffer
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for download
        res.setHeader('Content-Disposition', 'attachment; filename=product-upload-template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk upload products from Excel
const bulkUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Read the uploaded file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const results = {
            success: [],
            errors: []
        };

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Basic validation
                if (!row['Product Name'] || !row['Category Slug'] || !row['SKU']) {
                    results.errors.push({
                        row: i + 2,
                        error: 'Missing required fields: Product Name, Category Slug, or SKU'
                    });
                    continue;
                }

                // Find category by slug
                const category = await Category.findOne({ slug: row['Category Slug'] });
                if (!category) {
                    results.errors.push({
                        row: i + 2,
                        error: `Category with slug "${row['Category Slug']}" not found`
                    });
                    continue;
                }

                // Generate slug from product name
                const slug = slugify(row['Product Name']);

                // Parse Sizes
                let sizes = [];
                let totalStockFromSizes = 0;
                if (row['Sizes']) {
                    const sizeParts = row['Sizes'].toString().split(',');
                    sizeParts.forEach(part => {
                        const [size, stock] = part.split(':');
                        if (size && stock) {
                            const sQty = parseInt(stock.trim()) || 0;
                            sizes.push({ size: size.trim(), stock: sQty });
                            totalStockFromSizes += sQty;
                        }
                    });
                } else if (row['Stock']) {
                    // Fallback to a default size if only Stock is provided
                    totalStockFromSizes = parseInt(row['Stock']);
                    sizes = [{ size: 'Standard', stock: totalStockFromSizes }];
                }

                // Parse Images
                let images = [];
                const imageUrls = row['Image URLs'] || row['Image URL'];
                if (imageUrls) {
                    const urls = imageUrls.toString().split(',').map(url => url.trim());
                    images = urls.map((url, index) => ({
                        url,
                        isMain: index === 0
                    }));
                }

                // Parse Specifications (Details)
                let details = [];
                if (row['Specifications']) {
                    const detailParts = row['Specifications'].toString().split(',');
                    detailParts.forEach(part => {
                        const [label, value] = part.split(':');
                        if (label && value) {
                            details.push({ label: label.trim(), value: value.trim() });
                        }
                    });
                }

                // Create product object
                const productData = {
                    name: row['Product Name'],
                    description: row['Description'] || '',
                    price: parseFloat(row['Price']) || 0,
                    originalPrice: row['Original Price'] ? parseFloat(row['Original Price']) : 0,
                    category: category._id,
                    stock: totalStockFromSizes,
                    sizes: sizes,
                    sku: row['SKU'],
                    slug: slug,
                    images: images,
                    details: details,
                    isActive: true
                };

                // Check if SKU already exists
                const existingSKU = await Product.findOne({ sku: productData.sku });
                if (existingSKU) {
                    // Update existing product if SKU matches? 
                    // For now, let's keep it as error to avoid unintentional overwrites
                    results.errors.push({
                        row: i + 2,
                        error: `SKU "${productData.sku}" already exists`
                    });
                    continue;
                }

                // Create product
                await Product.create(productData);
                results.success.push({
                    row: i + 2,
                    name: productData.name
                });

            } catch (error) {
                results.errors.push({
                    row: i + 2,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Uploaded ${results.success.length} products successfully`,
            data: results
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateTemplate,
    bulkUpload
};

