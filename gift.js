document.addEventListener('DOMContentLoaded', async () => {
    const giftId = window.location.pathname.split('/').pop();
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    const giftInner = document.querySelector('.gift-inner');
    const giftImage = document.getElementById('giftImage');
    const giftMessage = document.getElementById('giftMessage');
    const progress = document.querySelector('.progress');
    const themeBackground = document.querySelector('.theme-background');
    const instructions = document.querySelector('.instructions');
    
    const API_URL = window.location.origin;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchedPixels = 0;
    let totalPixels = 0;
    
    // Set up canvas
    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        totalPixels = canvas.width * canvas.height;
    }

    // Handle scratch effect
    function scratch(e) {
        if (!isDrawing) return;
        
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 50;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
        
        // Calculate progress
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }
        
        const percentRevealed = (transparent / totalPixels) * 100;
        progress.style.width = `${percentRevealed}%`;
        
        if (percentRevealed > 50 && !giftInner.classList.contains('revealed')) {
            giftInner.classList.add('revealed');
            instructions.style.opacity = '0';
            setTimeout(() => {
                canvas.style.display = 'none';
                instructions.style.display = 'none';
            }, 500);
        }
    }

    try {
        // Fetch gift data
        const response = await fetch(`${API_URL}/api/gifts/${giftId}`).catch(error => {
            throw new Error('Network error: Please make sure the server is running');
        });
        const data = await response.json();

        if (data.success) {
            const { gift } = data;
            
            // Set theme background
            themeBackground.dataset.theme = gift.theme;
            
            // Set gift content
            if (gift.imageUrl) {
                giftImage.src = API_URL + gift.imageUrl;
            } else {
                giftImage.style.display = 'none';
            }
            giftMessage.textContent = gift.message;
            
            // Set up canvas after content is loaded
            setupCanvas();
            
            // Event listeners for scratch effect
            const startDrawing = (e) => {
                isDrawing = true;
                lastX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                lastY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            };
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('touchstart', startDrawing);
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('touchmove', scratch);
            canvas.addEventListener('mouseup', () => isDrawing = false);
            canvas.addEventListener('touchend', () => isDrawing = false);
            window.addEventListener('resize', setupCanvas);
            
        } else {
            throw new Error('Gift not found');
        }
    } catch (error) {
        alert('Error loading gift: ' + error.message);
    }
}); 