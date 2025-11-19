document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    //  LOGIN FORM HANDLER
    // ========================================================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const button = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // KUNCI PERBAIKAN 1: Nonaktifkan tombol secara langsung dan instan
            button.disabled = true;
            window.dispatchEvent(new CustomEvent('loading:start'));
            
            const errorMessage = document.getElementById('error-message');
            errorMessage.classList.add('hidden');

            try {
                const formData = new FormData(loginForm);
                const data = Object.fromEntries(formData.entries());

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
                    // Kita tidak perlu mengaktifkan kembali tombolnya karena halaman akan berganti
                } else {
                    errorMessage.textContent = result.error || 'Terjadi kesalahan.';
                    errorMessage.classList.remove('hidden');
                    // Aktifkan kembali tombol jika login gagal
                    button.disabled = false; 
                    window.dispatchEvent(new CustomEvent('loading:stop'));
                }
            } catch (error) {
                 errorMessage.textContent = 'Tidak bisa terhubung ke server.';
                 errorMessage.classList.remove('hidden');
                 // Aktifkan kembali tombol jika terjadi error koneksi
                 button.disabled = false;
                 window.dispatchEvent(new CustomEvent('loading:stop'));
            }
        });
    }

    // ========================================================================
    //  REGISTER FORM HANDLER
    // ========================================================================
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const button = registerForm.querySelector('button[type="submit"]');

        registerForm.addEventListener('submit', async (event) => {
            console.log('REGISTER HANDLER TERPASANG');
            event.preventDefault();
            // KUNCI PERBAIKAN 1: Nonaktifkan tombol secara langsung dan instan
            button.disabled = true;
            window.dispatchEvent(new CustomEvent('loading:start'));
            
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');

            try {
                const formData = new FormData(registerForm);
                const data = Object.fromEntries(formData.entries());

                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (response.ok) {
                    registerForm.reset();
                    successMessage.textContent = 'Registrasi berhasil! Anda akan diarahkan ke halaman login...';
                    successMessage.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                    // Kita tidak perlu mengaktifkan kembali tombolnya karena halaman akan berganti
                } else {
                    errorMessage.textContent = result.error || 'Terjadi kesalahan.';
                    errorMessage.classList.remove('hidden');
                    // Aktifkan kembali tombol jika registrasi gagal
                    button.disabled = false;
                    window.dispatchEvent(new CustomEvent('loading:stop'));
                }
            } catch (error) {
                 errorMessage.textContent = 'Tidak bisa terhubung ke server. Pastikan backend berjalan dan periksa terminalnya.';
                 errorMessage.classList.remove('hidden');
                 // Aktifkan kembali tombol jika terjadi error koneksi
                 button.disabled = false;
                 window.dispatchEvent(new CustomEvent('loading:stop'));
            }
        });
    }
});

// Listener 'pageshow' ini untuk mengatasi cache browser saat menekan tombol "kembali"
window.addEventListener('pageshow', () => {
    // Cari semua tombol submit di halaman dan pastikan mereka aktif
    const buttons = document.querySelectorAll('form button[type="submit"]');
    buttons.forEach(button => button.disabled = false);
    // Kirim juga event untuk mereset visual loading di Alpine
    window.dispatchEvent(new CustomEvent('loading:stop'));
});