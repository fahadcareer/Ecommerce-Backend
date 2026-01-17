const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../common/auth.middleware');

router.route('/')
    .get(getSettings)
    .patch(protect, authorize('admin'), updateSettings);

module.exports = router;
