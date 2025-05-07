let cropper;
let editingPostId = null;
let posts = [];
const postsPerPage = 10;
let currentPage = 1;
let currentFilter = '';
let currentSearch = '';
let currentDateSort = 'newest';

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');

// Kiểm tra trạng thái đăng nhập từ localStorage
if (localStorage.getItem('isLoggedIn') === 'true') {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    loadPosts();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await response.json();

    if (result.success) {
        localStorage.setItem('isLoggedIn', 'true');
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        loadPosts();
    } else {
        alert('Invalid username or password.');
    }
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
}

const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewCanvas = document.getElementById('preview');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            previewCanvas.style.display = 'block';
            if (cropper) cropper.destroy();
            cropper = new Cropper(imagePreview, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                cropBoxResizable: false,
                cropBoxMovable: true,
                dragMode: 'move',
                crop(event) {
                    const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
                    previewCanvas.getContext('2d').drawImage(canvas, 0, 0, 200, 200);
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('content', document.getElementById('content').value);
    formData.append('category', document.getElementById('category').value);

    const originalImageInput = document.getElementById('original-image');
    if (originalImageInput.files[0]) {
        formData.append('original-image', originalImageInput.files[0]);
    }

    if (cropper) {
        const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
        canvas.toBlob((blob) => {
            formData.append('image', blob, 'cropped-image.jpg');
            submitForm(formData);
        }, 'image/jpeg');
    } else {
        if (document.getElementById('image').files[0]) {
            formData.append('image', document.getElementById('image').files[0]);
        }
        submitForm(formData);
    }
});

async function submitForm(formData) {
    try {
        const method = editingPostId ? 'PUT' : 'POST';
        const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts';
        const response = await fetch(url, { method, body: formData });
        const result = await response.json();
        if (response.ok) {
            alert(editingPostId ? 'Article updated successfully!' : 'Article posted successfully!');
            document.getElementById('admin-form').reset();
            if (cropper) cropper.destroy();
            imagePreview.style.display = 'none';
            previewCanvas.style.display = 'none';
            editingPostId = null;
            document.querySelector('.submit-button').textContent = 'Post Article';
            loadPosts();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(data => {
            posts = data;
            applyFilterAndSearch();
        })
        .catch(err => {
            console.error('Error fetching posts:', err);
            document.getElementById('post-list').innerHTML = '<p>Error loading posts.</p>';
        });
}

function applyFilterAndSearch() {
    let filteredPosts = posts;
    if (currentFilter) {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    if (currentDateSort === 'newest') {
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    displayPosts(filteredPosts);
}

function displayPosts(filteredPosts) {
    const postList = document.getElementById('post-list');
    const pagination = document.getElementById('pagination');
    postList.innerHTML = '';

    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const postsToShow = filteredPosts.slice(start, end);

    postsToShow.forEach((post, index) => {
        const overallIndex = start + index + 1;
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.innerHTML = `
            <h3>${overallIndex}. ${post.title}</h3>
            <p>Category: ${post.category}</p>
            <p>${post.description}</p>
            <p>Date: ${new Date(post.date).toLocaleDateString()}</p>
            <button class="edit-button" onclick="editPost('${post._id}')">Edit</button>
            <button class="delete-button" onclick="deletePost('${post._id}')">Delete</button>
            <button class="move-up-button" onclick="movePost('${post._id}', 'up')">Move Up</button>
            <button class="move-down-button" onclick="movePost('${post._id}', 'down')">Move Down</button>
        `;
        postList.appendChild(postDiv);
    });

    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i === currentPage) pageLink.classList.add('active');
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayPosts(filteredPosts);
        });
        pagination.appendChild(pageLink);
    }
}

function editPost(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            document.getElementById('title').value = post.title;
            document.getElementById('description').value = post.description;
            document.getElementById('content').value = post.content;
            document.getElementById('category').value = post.category;
            editingPostId = postId;
            document.querySelector('.submit-button').textContent = 'Update Article';
            if (cropper) cropper.destroy();
            imagePreview.style.display = 'none';
            previewCanvas.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(err => console.error('Error fetching post:', err));
}

async function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            const result = await response.json();
            if (response.ok) {
                alert('Post deleted successfully!');
                loadPosts();
            } else {
                alert('Error deleting post: ' + result.error);
            }
        } catch (err) {
            alert('Error deleting post: ' + err.message);
        }
    }
}

async function movePost(postId, direction) {
    try {
        const response = await fetch(`/api/posts/${postId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ direction })
        });
        const result = await response.json();
        if (response.ok) {
            loadPosts();
        } else {
            alert('Error moving post: ' + result.error);
        }
    } catch (err) {
        alert('Error moving post: ' + err.message);
    }
}

document.getElementById('filter-category').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    currentPage = 1;
    applyFilterAndSearch();
});

document.getElementById('filter-date').addEventListener('change', (e) => {
    currentDateSort = e.target.value;
    currentPage = 1;
    applyFilterAndSearch();
});

document.getElementById('search-title').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    currentPage = 1;
    applyFilterAndSearch();
});