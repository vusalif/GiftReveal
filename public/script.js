document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.gift-form');
    const fileInput = document.getElementById('fileInput');
    const themeOptions = document.querySelectorAll('.theme-option');
    const uploadBtn = document.querySelector('.upload-btn');
    let selectedTheme = null;

    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTheme = option.dataset.theme;
        });
    });

    // Handle form submission
    uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const message = document.querySelector('textarea').value;
        if (!message || !selectedTheme) {
            alert('Please fill in the message and select a theme');
            return;
        }

        // For demo purposes, generate a unique ID
        const giftId = Math.random().toString(36).substring(2, 15);
        
        // Create a demo gift link
        const giftLink = `${window.location.origin}/gift.html?id=${giftId}`;

        // Show success modal
        const modal = document.getElementById('successModal');
        const giftLinkInput = document.getElementById('giftLink');
        giftLinkInput.value = giftLink;
        modal.classList.add('show');

        // Handle copy button
        const copyBtn = document.querySelector('.copy-link');
        copyBtn.addEventListener('click', () => {
            giftLinkInput.select();
            document.execCommand('copy');
            copyBtn.querySelector('.copy-text').textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.querySelector('.copy-text').textContent = 'Copy';
            }, 2000);
        });

        // Handle share buttons
        const whatsappBtn = document.querySelector('.share-btn.whatsapp');
        const emailBtn = document.querySelector('.share-btn.email');

        whatsappBtn.addEventListener('click', () => {
            const whatsappUrl = `https://wa.me/?text=I created a Christmas gift for you! Open it here: ${giftLink}`;
            window.open(whatsappUrl, '_blank');
        });

        emailBtn.addEventListener('click', () => {
            const emailUrl = `mailto:?subject=A Christmas Gift for You&body=I created a Christmas gift for you! Open it here: ${giftLink}`;
            window.location.href = emailUrl;
        });
    });

    // Handle modal close
    const closeModal = document.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('show');
    });
}); 