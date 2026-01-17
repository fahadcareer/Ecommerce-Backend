const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    heroImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1523381235208-175e18329481?q=80&w=2070&auto=format&fit=crop'
    },
    heroImages: [String],
    siteLogo: {
        type: String,
        default: 'Your Brand'
    },
    siteName: {
        type: String,
        default: 'Your Store'
    },
    siteFavicon: {
        type: String,
        default: '/favicon.ico'
    },
    footerAbout: {
        type: String,
        default: 'A modern eCommerce platform built to sell fashion and lifestyle products online.'
    },
    footerAddress: {
        type: String,
        default: 'Add your store address here'
    },
    footerTimings: {
        type: String,
        default: 'Business Hours'
    },
    footerWhatsApp: {
        type: String,
        default: '+00 00000 00000'
    },
    footerInstagram: {
        type: String,
        default: '@yourbrand'
    },
    newsletterImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop'
    },
    newsletterImages: [String]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
