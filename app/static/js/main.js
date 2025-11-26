document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-posts')) {
        handleFeedPage();
    }
});

/**
 * Menangani proses submit form login.
 * Fungsi ini dipanggil oleh Alpine.js dari file login.html.
 * @param {Event} event - Event object dari form submission.
 */
async function handleLoginSubmit(event) {
    // Dapatkan elemen form dan container Alpine-nya
    const loginForm = event.target;
    const container = loginForm.closest('[x-data]');

    // Siapkan data untuk dikirim ke API
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    
    // Siapkan elemen untuk menampilkan pesan error
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            // Jika berhasil, simpan token & data user, lalu arahkan ke feed
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = '/feed';
        } else {
            // Jika gagal, tampilkan pesan error dari API
            errorMessage.textContent = result.error || 'Terjadi kesalahan.';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
         // Jika server tidak bisa dihubungi
         errorMessage.textContent = 'Tidak bisa terhubung ke server.';
         errorMessage.classList.remove('hidden');
    } finally {
        // Apapun hasilnya, matikan status loading
        container.__x.data.isLoading = false;
    }
}

/**
 * Menangani proses submit form registrasi.
 * Fungsi ini dipanggil oleh Alpine.js dari file register.html.
 * @param {Event} event - Event object dari form submission.
 */
async function handleRegisterSubmit(event) {
    const registerForm = event.target;
    const container = registerForm.closest('[x-data]');

    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());
    
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            // Jika berhasil, reset form, tampilkan pesan sukses
            registerForm.reset();
            successMessage.textContent = 'Registrasi berhasil! Anda akan diarahkan ke halaman login...';
            successMessage.classList.remove('hidden');
            
            // Tunggu 3 detik sebelum mengarahkan ke halaman login
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } else {
            // Jika gagal, tampilkan pesan error dan matikan loading
            errorMessage.textContent = result.error || 'Terjadi kesalahan saat registrasi.';
            errorMessage.classList.remove('hidden');
            container.__x.data.isLoading = false;
        }
    } catch (error) {
         // Jika server tidak bisa dihubungi, matikan juga loading
         errorMessage.textContent = 'Tidak bisa terhubung ke server.';
         errorMessage.classList.remove('hidden');
         container.__x.data.isLoading = false;
    }
}


async function handleFeedPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    await fetchAndDisplayPosts(token);
}

/**
 * Mengambil data postingan dari API dan menampilkannya di halaman.
 * @param {string} token - JWT token untuk otorisasi.
 */
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


/**
 * 
 * @param {string} timestamp
 * @returns {string}
 */
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