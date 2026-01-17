const User = require('../schema/User');
const ApiError = require('../common/apiError');

const addAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    // If it's the first address, make it default
    if (user.addresses.length === 0) {
        addressData.isDefault = true;
    } else if (addressData.isDefault) {
        // If this one is set as default, unset others
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
};

const deleteAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) throw new ApiError(404, 'Address not found');

    const deletedAddress = user.addresses[addressIndex];
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and there are others left, make the first one default
    if (deletedAddress.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
};

const updateAddress = async (userId, addressId, updateData) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(404, 'Address not found');

    if (updateData.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, updateData);
    await user.save();
    return user.addresses;
};

module.exports = {
    addAddress,
    deleteAddress,
    updateAddress
};
