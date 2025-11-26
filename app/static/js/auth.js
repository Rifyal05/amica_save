document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const button = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
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
                } else {
                    errorMessage.textContent = result.error || 'Terjadi kesalahan.';
                    errorMessage.classList.remove('hidden');
                    button.disabled = false; 
                    window.dispatchEvent(new CustomEvent('loading:stop'));
                }
            } catch (error) {
                 errorMessage.textContent = 'Tidak bisa terhubung ke server.';
                 errorMessage.classList.remove('hidden');
                 button.disabled = false;
                 window.dispatchEvent(new CustomEvent('loading:stop'));
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const button = registerForm.querySelector('button[type="submit"]');

        registerForm.addEventListener('submit', async (event) => {
            console.log('REGISTER HANDLER TERPASANG');
            event.preventDefault();
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
                } else {
                    errorMessage.textContent = result.error || 'Terjadi kesalahan.';
                    errorMessage.classList.remove('hidden');
                    button.disabled = false;
                    window.dispatchEvent(new CustomEvent('loading:stop'));
                }
            } catch (error) {
                 errorMessage.textContent = 'Tidak bisa terhubung ke server. Pastikan backend berjalan dan periksa terminalnya.';
                 errorMessage.classList.remove('hidden');
                 button.disabled = false;
                 window.dispatchEvent(new CustomEvent('loading:stop'));
            }
        });
    }
});

window.addEventListener('pageshow', () => {
    const buttons = document.querySelectorAll('form button[type="submit"]');
    buttons.forEach(button => button.disabled = false);
    window.dispatchEvent(new CustomEvent('loading:stop'));
});