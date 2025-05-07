const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes
const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

// Route đăng nhập
const User = require('./models/User');
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error during login.' });
    }
});

// Route tạo user admin (chỉ chạy một lần)
app.get('/setup-admin', async (req, res) => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const adminUser = new User({ username: 'admin', password: 'password123' });
            await adminUser.save();
            res.send('Admin user created successfully.');
        } else {
            res.send('Admin user already exists.');
        }
    } catch (err) {
        res.status(500).send('Error creating admin user.');
    }
});

// Route cho trang Admin
app.get('/hidden-admin', (req, res) => {
    console.log('GET /hidden-admin: Displaying admin page');
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});