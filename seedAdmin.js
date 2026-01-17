const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./schema/User');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const adminEmail = 'admin@example.com';
        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin created: admin@example.com / admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
