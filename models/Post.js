const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    category: String,
    image: String, // Ảnh cắt (dùng cho trang chính)
    originalImage: String, // Ảnh gốc (dùng cho trang chi tiết)
    date: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', postSchema);