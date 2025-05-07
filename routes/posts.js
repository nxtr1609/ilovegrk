const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
    try {
        console.log('GET /api/posts: Fetching posts');
        const category = req.query.category;
        const query = category ? { category } : {};
        const posts = await Post.find(query).sort({ order: -1 });
        res.json(posts);
    } catch (err) {
        console.error('GET /api/posts error:', err);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/posts/${req.params.id}: Fetching post`);
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error(`GET /api/posts/${req.params.id} error:`, err);
        res.status(500).json({ error: 'Error fetching post' });
    }
});

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'original-image', maxCount: 1 }]), async (req, res) => {
    try {
        console.log('POST /api/posts: Creating new post');
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files);
        const { title, description, content, category } = req.body;
        if (!title || !description || !content || !category) {
            throw new Error('Missing required fields');
        }
        const image = req.files['image'] ? req.files['image'][0].filename : '';
        const originalImage = req.files['original-image'] ? req.files['original-image'][0].filename : '';
        const maxOrder = await Post.findOne().sort({ order: -1 });
        const newOrder = maxOrder ? maxOrder.order + 1 : 0;
        const newPost = new Post({ title, description, content, category, image, originalImage, order: newOrder });
        await newPost.save();
        console.log('Post created successfully:', newPost);
        res.status(201).json({ message: 'Post created successfully' });
    } catch (err) {
        console.error('POST /api/posts error:', err.message, err.stack);
        res.status(500).json({ error: 'Error creating post: ' + err.message });
    }
});

router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'original-image', maxCount: 1 }]), async (req, res) => {
    try {
        console.log(`PUT /api/posts/${req.params.id}: Updating post`);
        const { title, description, content, category } = req.body;
        if (!title || !description || !content || !category) {
            throw new Error('Missing required fields');
        }
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.title = title;
        post.description = description;
        post.content = content;
        post.category = category;

        if (req.files['image']) {
            post.image = req.files['image'][0].filename;
        }
        if (req.files['original-image']) {
            post.originalImage = req.files['original-image'][0].filename;
        }

        await post.save();
        res.json({ message: 'Post updated successfully' });
    } catch (err) {
        console.error(`PUT /api/posts/${req.params.id} error:`, err);
        res.status(500).json({ error: 'Error updating post: ' + err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/posts/${req.params.id}: Deleting post`);
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(`DELETE /api/posts/${req.params.id} error:`, err);
        res.status(500).json({ error: 'Error deleting post' });
    }
});

router.put('/:id/move', async (req, res) => {
    try {
        console.log(`PUT /api/posts/${req.params.id}/move: Moving post`);
        const { direction } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const posts = await Post.find({ category: post.category }).sort({ order: -1 });
        const currentIndex = posts.findIndex(p => p._id.toString() === post._id.toString());
        if (direction === 'up' && currentIndex > 0) {
            const prevPost = posts[currentIndex - 1];
            const tempOrder = post.order;
            post.order = prevPost.order;
            prevPost.order = tempOrder;
            await post.save();
            await prevPost.save();
        } else if (direction === 'down' && currentIndex < posts.length - 1) {
            const nextPost = posts[currentIndex + 1];
            const tempOrder = post.order;
            post.order = nextPost.order;
            nextPost.order = tempOrder;
            await post.save();
            await nextPost.save();
        }
        res.json({ message: 'Post order updated successfully' });
    } catch (err) {
        console.error(`PUT /api/posts/${req.params.id}/move error:`, err);
        res.status(500).json({ error: 'Error moving post' });
    }
});

module.exports = router;