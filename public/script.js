document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.gift-form');
    const fileInput = document.getElementById('fileInput');
    const themeOptions = document.querySelectorAll('.theme-option');
    const uploadBtn = document.querySelector('.upload-btn');
    let selectedTheme = null;
    const API_URL = window.location.origin;
    const modal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    const copyBtn = document.querySelector('.copy-link');
    const giftLinkInput = document.getElementById('giftLink');
    const whatsappBtn = document.querySelector('.share-btn.whatsapp');
    const emailBtn = document.querySelector('.share-btn.email');

    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.style.border = '2px solid transparent');
            option.style.border = '2px solid var(--accent-color)';
            selectedTheme = option.dataset.theme;
        });
    });

    // Modal functions
    function showModal(giftLink) {
        giftLinkInput.value = giftLink;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Copy link function
    async function copyLink() {
        try {
            await navigator.clipboard.writeText(giftLinkInput.value);
            const copyText = copyBtn.querySelector('.copy-text');
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyText.textContent = 'Copy';
            }, 2000);
        } catch (err) {
            alert('Failed to copy link');
        }
    }

    // Share functions
    function shareOnWhatsApp() {
        const url = `https://wa.me/?text=${encodeURIComponent('Check out your Christmas gift! 🎄\n' + giftLinkInput.value)}`;
        window.open(url, '_blank');
    }

    function shareViaEmail() {
        const subject = encodeURIComponent('A Christmas Gift for You! 🎄');
        const body = encodeURIComponent('Check out your Christmas gift!\n\n' + giftLinkInput.value);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    // Event listeners
    closeModal.addEventListener('click', hideModal);
    copyBtn.addEventListener('click', copyLink);
    whatsappBtn.addEventListener('click', shareOnWhatsApp);
    emailBtn.addEventListener('click', shareViaEmail);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Get remaining gifts count
    const updateRemainingGifts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/gifts/remaining`);
            const data = await response.json();
            if (data.success) {
                const giftCounter = document.querySelector('.gift-counter');
                const counterText = giftCounter.querySelector('p');
                
                if (data.remaining === 0) {
                    counterText.textContent = 'No gifts remaining today';
                    giftCounter.classList.add('limit-reached');
                    uploadBtn.disabled = true;
                    uploadBtn.textContent = 'Daily limit reached';
                } else {
                    const giftWord = data.remaining === 1 ? 'gift' : 'gifts';
                    counterText.textContent = `${data.remaining} ${giftWord} remaining today`;
                    giftCounter.classList.remove('limit-reached');
                }
            }
        } catch (error) {
            console.error('Error fetching remaining gifts:', error);
            document.querySelector('.gift-counter p').textContent = 'Unable to check remaining gifts';
        }
    };

    // Update remaining gifts count on load
    updateRemainingGifts();

    // Handle form submission
    uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!selectedTheme) {
            alert('Please select a theme');
            return;
        }

        const message = document.querySelector('textarea').value;
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        const formData = new FormData();
        formData.append('message', message);
        formData.append('theme', selectedTheme);
        
        if (fileInput.files[0]) {
            formData.append('image', fileInput.files[0]);
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        try {
            const response = await fetch(`${API_URL}/api/gifts`, {
                method: 'POST',
                body: formData
            }).catch(error => {
                throw new Error('Network error: Please make sure the server is running');
            });

            const data = await response.json();
            
            if (data.success) {
                showModal(data.giftUrl);
                
                // Reset form
                document.querySelector('textarea').value = '';
                fileInput.value = '';
                themeOptions.forEach(opt => opt.style.border = '2px solid transparent');
                selectedTheme = null;
                
                // Update remaining gifts count
                updateRemainingGifts();
            } else {
                alert(data.error || 'Failed to create gift');
                if (data.error.includes('maximum limit')) {
                    updateRemainingGifts(); // Update counter to show limit reached
                }
                return;
            }
        } catch (error) {
            alert('Error creating gift: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload';
        }
    });
}); 