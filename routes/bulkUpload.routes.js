const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateTemplate, bulkUpload } = require('../controllers/bulkUpload.controller');
const { protect, authorize } = require('../common/auth.middleware');

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Download template
router.get('/template', protect, authorize('admin'), generateTemplate);

// Upload bulk products
router.post('/upload', protect, authorize('admin'), upload.single('file'), bulkUpload);

module.exports = router;
