document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const button = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            setLoadingState(true, button);
            clearMessages();

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
                    handleLoginSuccess(result);
                } else {
                    showError(result.error || 'Terjadi kesalahan saat login.');
                    setLoadingState(false, button);
                }
            } catch (error) {
                 showError('Tidak bisa terhubung ke server.');
                 setLoadingState(false, button);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const button = registerForm.querySelector('button[type="submit"]');

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            setLoadingState(true, button);
            clearMessages();

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
                    showSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
                    setTimeout(() => {
                        window.location.href = '/login'; 
                    }, 2000);
                } else {
                    showError(result.error || 'Gagal mendaftar.');
                    setLoadingState(false, button);
                }
            } catch (error) {
                 showError('Tidak bisa terhubung ke server.');
                 setLoadingState(false, button);
            }
        });
    }

    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            
            if (typeof firebase === 'undefined') {
                showError("Sistem Google Login belum siap (Firebase SDK missing).");
                return;
            }

            setLoadingState(true, googleBtn);
            clearMessages();

            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                
                const token = await result.user.getIdToken();

                const response = await fetch('/api/auth/google-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token })
                });

                const apiResult = await response.json();

                if (response.ok) {
                    handleLoginSuccess(apiResult);
                } else {
                    throw new Error(apiResult.error || 'Gagal verifikasi Google Login.');
                }

            } catch (error) {
                console.error("Google Auth Error:", error);
                let msg = error.message;
                if (error.code === 'auth/popup-closed-by-user') {
                    msg = "Login dibatalkan (Popup ditutup).";
                }
                showError(msg);
                setLoadingState(false, googleBtn);
            }
        });
    }
});


function setLoadingState(isLoading, buttonElement) {
    if (isLoading) {
        if(buttonElement) buttonElement.disabled = true;
        window.dispatchEvent(new CustomEvent('loading:start')); 
    } else {
        if(buttonElement) buttonElement.disabled = false;
        window.dispatchEvent(new CustomEvent('loading:stop'));
    }
}

function handleLoginSuccess(result) {

    localStorage.setItem('authToken', result.token);
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    
    window.location.href = '/feed';
}

function clearMessages() {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    } else {
        alert(message); 
    }
}

function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.remove('hidden');
    }
}

window.addEventListener('pageshow', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = false);
    window.dispatchEvent(new CustomEvent('loading:stop'));
});