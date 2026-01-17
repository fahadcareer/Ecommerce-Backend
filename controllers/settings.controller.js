const Settings = require('../schema/Settings');
const apiResponse = require('../common/apiResponse');

const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        apiResponse(res, 200, 'Settings retrieved', settings);
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
        }
        apiResponse(res, 200, 'Settings updated successfully', settings);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    updateSettings
};
