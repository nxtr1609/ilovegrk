const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

fetch(`/api/posts/${postId}`)
    .then(response => response.json())
    .then(post => {
        document.getElementById('post-title').textContent = post.title;
        const imageDiv = document.getElementById('post-image');
        if (post.image) {
            const img = document.createElement('img');
            img.src = post.originalImage ? `/images/${post.originalImage}` : `/images/${post.image}`;
            img.alt = post.title;
            img.classList.add('event-image');
            img.setAttribute('loading', 'lazy');
            imageDiv.appendChild(img);
        }
        const contentDiv = document.getElementById('post-content');
        const description = document.createElement('p');
        description.textContent = post.description;
        contentDiv.appendChild(description);
        const content = document.createElement('p');
        content.textContent = post.content;
        contentDiv.appendChild(content);
        const donateCall = document.createElement('p');
        donateCall.classList.add('donate-call');
        donateCall.innerHTML = 'Like this post? Support me with a coffee! ☕ <a href="donate.html">Donate here</a>';
        contentDiv.appendChild(donateCall);

        document.getElementById('meta-title').textContent = `${post.title} - Silly Tales - I Love Grok`;
        document.getElementById('meta-description').setAttribute('content', post.description.length > 150 ? post.description.substring(0, 147) + '...' : post.description);
        document.getElementById('meta-og-title').setAttribute('content', `${post.title} - Silly Tales - I Love Grok`);
        document.getElementById('meta-og-description').setAttribute('content', post.description.length > 150 ? post.description.substring(0, 147) + '...' : post.description);
        document.getElementById('meta-og-url').setAttribute('content', `http://localhost:3000/sillytale-post.html?id=${post._id}`);
        document.getElementById('meta-og-image').setAttribute('content', post.originalImage ? `/images/${post.originalImage}` : '/images/Silly01.jpg');

        fetch(`/api/posts?category=${post.category}`)
            .then(response => response.json())
            .then(posts => {
                posts.sort((a, b) => b.order - a.order);
                const currentIndex = posts.findIndex(p => p._id === post._id);
                const prevButton = document.getElementById('prev-post');
                const nextButton = document.getElementById('next-post');
                const prevTitle = document.getElementById('prev-title');
                const nextTitle = document.getElementById('next-title');

                if (currentIndex < posts.length - 1) {
                    const prevPost = posts[currentIndex + 1];
                    prevButton.disabled = false;
                    prevButton.onclick = () => window.location.href = `sillytale-post.html?id=${prevPost._id}`;
                    prevTitle.textContent = prevPost.title.length > 30 ? prevPost.title.substring(0, 27) + '...' : prevPost.title;
                }

                if (currentIndex > 0) {
                    const nextPost = posts[currentIndex - 1];
                    nextButton.disabled = false;
                    nextButton.onclick = () => window.location.href = `sillytale-post.html?id=${nextPost._id}`;
                    nextTitle.textContent = nextPost.title.length > 30 ? nextPost.title.substring(0, 27) + '...' : nextPost.title;
                }
            })
            .catch(err => console.error('Error fetching posts for navigation:', err));
    })
    .catch(err => {
        console.error('Error fetching post:', err);
        document.getElementById('post-content').innerHTML = '<p>Error loading post.</p>';
    });