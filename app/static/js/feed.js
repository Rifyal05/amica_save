document.addEventListener('DOMContentLoaded', () => {
    handleFeedPage();
});

async function handleFeedPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    await fetchAndDisplayPosts(token);
}

async function fetchAndDisplayPosts(token) {
    const feedContainer = document.getElementById('feed-posts');
    const loadingSpinner = document.getElementById('loading-spinner');
    const postTemplate = document.getElementById('post-card-template');

    try {
        const response = await fetch('/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }

        const data = await response.json();
        
        if(loadingSpinner) loadingSpinner.style.display = 'none';

        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postCard = postTemplate.content.cloneNode(true);
                postCard.querySelector('.author-name').textContent = post.author.display_name;
                postCard.querySelector('.author-avatar').src = post.author.avatar_url || 'https://i.pravatar.cc/150';
                postCard.querySelector('.post-timestamp').textContent = timeAgo(post.created_at);
                postCard.querySelector('.post-caption').textContent = post.caption;
                postCard.querySelector('.like-count').textContent = post.likes_count;
                postCard.querySelector('.comment-count').textContent = post.comments_count;
                if (post.image_url) {
                    const imgContainer = postCard.querySelector('.post-image-container');
                    const imgElement = postCard.querySelector('.post-image');
                    imgElement.src = post.image_url;
                    imgContainer.classList.remove('hidden');
                }
                feedContainer.appendChild(postCard);
            });
        } else {
            feedContainer.innerHTML = '<p class="text-center text-gray-500">Belum ada postingan untuk ditampilkan.</p>';
        }

    } catch (error) {
        console.error("Error fetching posts:", error);
        if(loadingSpinner) loadingSpinner.textContent = `Gagal memuat postingan. ${error.message}`;
    }
}

function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
}