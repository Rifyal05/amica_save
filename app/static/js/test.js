document.addEventListener('DOMContentLoaded', () => {
    handleTestPage();
});

function handleTestPage() {
    const textForm = document.getElementById('text-test-form');
    const textInput = document.getElementById('test-caption');
    const textResult = document.getElementById('text-result');
    const textButton = document.getElementById('text-test-button');

    const imageForm = document.getElementById('image-test-form');
    const imageInput = document.getElementById('test-image');
    const imageResult = document.getElementById('image-result');
    const imageButton = document.getElementById('image-test-button');

    const feedbackForm = document.getElementById('feedback-test-form');
    const feedbackInput = document.getElementById('test-feedback');
    const feedbackResult = document.getElementById('feedback-result');
    const feedbackButton = document.getElementById('feedback-test-button');

    textForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        textResult.textContent = "Menganalisis...";
        textResult.className = 'result-box';
        textButton.disabled = true;
        textButton.textContent = "Memproses...";
        try {
            const response = await fetch('/api/test/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput.value })
            });
            const data = await response.json();
            textResult.textContent = `Status: ${data.status.toUpperCase()} | Alasan: ${data.reason}`;
            textResult.classList.add(data.status);
        } catch (error) {
            textResult.textContent = `Error: ${error.message}`;
            textResult.classList.add('unsafe');
        } finally {
            textButton.disabled = false;
            textButton.textContent = "Uji Teks";
        }
    });

    imageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!imageInput.files[0]) {
            imageResult.textContent = "Pilih file gambar terlebih dahulu.";
            imageResult.className = 'result-box unsafe';
            return;
        }
        imageResult.textContent = "Menganalisis...";
        imageResult.className = 'result-box';
        imageButton.disabled = true;
        imageButton.textContent = "Memproses...";
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        try {
            const response = await fetch('/api/test/image', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            imageResult.textContent = `Status: ${data.status.toUpperCase()} | Alasan: ${data.reason}`;
            imageResult.classList.add(data.status);
        } catch (error) {
            imageResult.textContent = `Error: ${error.message}`;
            imageResult.classList.add('unsafe');
        } finally {
            imageButton.disabled = false;
            imageButton.textContent = "Uji Gambar";
        }
    });

    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackResult.textContent = "Menganalisis...";
        feedbackResult.className = 'result-box';
        feedbackButton.disabled = true;
        feedbackButton.textContent = "Memproses...";
        try {
            const response = await fetch('/api/test/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: feedbackInput.value })
            });
            const data = await response.json();
            feedbackResult.textContent = `Sentimen terdeteksi: ${data.sentiment.toUpperCase()}`;
            feedbackResult.classList.add(data.sentiment === 'positive' ? 'safe' : 'unsafe');
        } catch (error) {
            feedbackResult.textContent = `Error: ${error.message}`;
            feedbackResult.classList.add('unsafe');
        } finally {
            feedbackButton.disabled = false;
            feedbackButton.textContent = "Uji Sentimen";
        }
    });
}