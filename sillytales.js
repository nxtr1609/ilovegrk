let posts = [];
const postsPerPage = 10;
let currentPage = 1;
let currentSearch = '';

const loadingSpinner = document.getElementById('loading-spinner');
const postContainer = document.getElementById('sillytales-posts');

loadingSpinner.style.display = 'block';
postContainer.style.display = 'none';

fetch('/api/posts?category=sillytales')
    .then(response => response.json())
    .then(data => {
        posts = data;
        applySearch();
        loadingSpinner.style.display = 'none';
        postContainer.style.display = 'block';
    })
    .catch(err => {
        console.error('Error fetching posts:', err);
        document.getElementById('sillytales-posts').innerHTML = '<p>Error loading posts.</p>';
        loadingSpinner.style.display = 'none';
        postContainer.style.display = 'block';
    });

function applySearch() {
    let filteredPosts = posts;
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    displayPosts(filteredPosts);
}

function displayPosts(filteredPosts) {
    const postContainer = document.getElementById('sillytales-posts');
    const pagination = document.getElementById('pagination');
    postContainer.innerHTML = '';

    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const postsToShow = filteredPosts.slice(start, end);

    postsToShow.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        let postHTML = '';
        postHTML += post.image ? `<img src="/images/${post.image}" alt="${post.title}" class="post-image" loading="lazy">` : '';
        postHTML += `
            <h3><a href="sillytale-post.html?id=${post._id}">${post.title}</a></h3>
            <p>${post.description}</p>
        `;
        postDiv.innerHTML = postHTML;
        postContainer.appendChild(postDiv);
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

document.getElementById('search-title').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    currentPage = 1;
    applySearch();
});