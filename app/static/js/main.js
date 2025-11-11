document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        handleLoginPage();
    }
    if (document.getElementById('register-form')) {
        handleRegisterPage();
    }
    if (document.getElementById('forgot-password-form')) {
        handleForgotPasswordPage();
    }
    if (document.getElementById('feed-posts')) {
        handleFeedPage();
    }
});

function handleLoginPage() {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginButton.disabled = true;
        loginButton.textContent = 'Memproses...';
        errorMessage.style.display = 'none';
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                window.location.href = '/feed';
            } else {
                errorMessage.textContent = result.error || 'Terjadi kesalahan.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'Tidak bisa terhubung ke server.';
            errorMessage.style.display = 'block';
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Masuk';
        }
    });
}

function handleRegisterPage() {
    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        registerButton.disabled = true;
        registerButton.textContent = 'Memproses...';
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                registerForm.reset();
                successMessage.textContent = 'Registrasi berhasil! Anda akan diarahkan ke halaman login.';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                errorMessage.textContent = result.error || 'Terjadi kesalahan saat registrasi.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'Tidak bisa terhubung ke server.';
            errorMessage.style.display = 'block';
        } finally {
            if (!successMessage.style.display || successMessage.style.display === 'none') {
                registerButton.disabled = false;
                registerButton.textContent = 'Daftar';
            }
        }
    });
}

function handleForgotPasswordPage() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    forgotPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Fitur Lupa Password sedang dalam pengembangan. API backend belum tersedia.');
    });
}

async function handleFeedPage() {
    const logoutButton = document.getElementById('logout-button');
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    });
    updateUserInfoSidebar();
    await fetchAndDisplayPosts(token);
}

async function fetchAndDisplayPosts(token) {
    const feedContainer = document.getElementById('feed-posts');
    const loadingSpinner = document.getElementById('loading-spinner');
    const API_BASE_URL = `${window.location.protocol}//${window.location.host}`;
    try {
        const response = await fetch('/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            throw new Error(`Gagal mengambil data: ${response.status}`);
        }
        const data = await response.json();
        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postElement = createPostElement(post, API_BASE_URL);
                feedContainer.appendChild(postElement);
            });
        } else {
            feedContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">Belum ada postingan untuk ditampilkan.</p>';
        }
    } catch (error) {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        feedContainer.innerHTML = `<p style="text-align: center; color: red;">Terjadi kesalahan: ${error.message}</p>`;
    }
}

function createPostElement(post, baseUrl) {
    const template = document.getElementById('post-template');
    const postCard = template.content.cloneNode(true).querySelector('.post-card');
    postCard.dataset.postId = post.id;
    const fullImageUrl = post.image_url ? `${baseUrl}${post.image_url}` : null;
    postCard.querySelector('.author-avatar').src = post.author.avatar_url || 'https://i.pravatar.cc/150';
    postCard.querySelector('.author-name').textContent = post.author.display_name;
    postCard.querySelector('.post-timestamp').textContent = timeAgo(post.created_at);
    postCard.querySelector('.post-caption').textContent = post.caption;
    const tagsContainer = postCard.querySelector('.tags-container');
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-chip';
            tagElement.textContent = `#${tag}`;
            tagsContainer.appendChild(tagElement);
        });
    }
    const imageContainer = postCard.querySelector('.post-image-container');
    if (fullImageUrl) {
        postCard.querySelector('.post-image').src = fullImageUrl;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }
    const likeCountSpan = postCard.querySelector('.like-count');
    const commentCountSpan = postCard.querySelector('.comment-count');
    likeCountSpan.textContent = post.likes_count;
    commentCountSpan.textContent = post.comments_count;
    const likeButton = postCard.querySelector('.like-button');
    likeButton.addEventListener('click', () => handleLike(post.id, likeButton, likeCountSpan));
    return postCard;
}

async function handleLike(postId, button, countSpan) {
    const token = localStorage.getItem('authToken');
    button.disabled = true;
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            countSpan.textContent = data.likes_count;
            button.classList.toggle('liked', data.liked);
            const heartOutline = button.querySelector('.icon-heart-outline');
            const heartFilled = button.querySelector('.icon-heart-filled');
            heartOutline.style.display = data.liked ? 'none' : 'block';
            heartFilled.style.display = data.liked ? 'block' : 'none';
        }
    } catch (error) {
        console.error("Gagal melakukan like:", error);
    } finally {
        button.disabled = false;
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

function updateUserInfoSidebar() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) return;
    const user = JSON.parse(userString);
    const nameSpan = document.getElementById('sidebar-user-name');
    const avatarImg = document.getElementById('sidebar-user-avatar');
    if (nameSpan) nameSpan.textContent = user.display_name || "Pengguna";
    if (avatarImg) avatarImg.src = user.avatar_url || 'https://i.pravatar.cc/150';
}