require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "blob:", "data:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX
});
app.use('/api/', limiter);

// Create required directories
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const themesDir = path.join(publicDir, 'themes');

[publicDir, uploadsDir, themesDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Store gifts in memory (for development)
const gifts = new Map();

// Store IP addresses and their gift counts
const ipGiftCounts = new Map();

// Function to get client IP address
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket.remoteAddress;
};

// Function to check gift limit
const checkGiftLimit = (ip) => {
    const count = ipGiftCounts.get(ip) || 0;
    return count < 3;
};

// Middleware to check gift limit
const giftLimitMiddleware = (req, res, next) => {
    const clientIP = getClientIP(req);
    console.log(`Gift attempt from IP: ${clientIP}`);
    if (!checkGiftLimit(clientIP)) {
        console.log(`Gift limit reached for IP: ${clientIP}`);
        return res.status(429).json({ 
            success: false, 
            error: 'You have reached the maximum limit of 3 gifts'
        });
    }
    console.log(`Gifts created by IP ${clientIP}: ${ipGiftCounts.get(clientIP) || 0}`);
    next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname)));
app.use('/themes.css', express.static(path.join(__dirname, 'public', 'themes.css')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { 
        fileSize: parseInt(process.env.MAX_FILE_SIZE) 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Routes
app.get('/api/gifts/remaining', (req, res) => {
    const clientIP = getClientIP(req);
    const used = ipGiftCounts.get(clientIP) || 0;
    const remaining = Math.max(0, 3 - used);
    res.json({ 
        success: true, 
        remaining,
        total: 3
    });
});

app.get('/api/gifts/:id', (req, res) => {
    const gift = gifts.get(req.params.id);
    if (gift) {
        res.json({ success: true, gift });
    } else {
        res.status(404).json({ success: false, error: 'Gift not found' });
    }
});

app.post('/api/gifts', giftLimitMiddleware, upload.single('image'), (req, res) => {
    try {
        const { message, theme } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const giftId = uuidv4();
        const clientIP = getClientIP(req);

        // Increment gift count for this IP
        const currentCount = ipGiftCounts.get(clientIP) || 0;
        ipGiftCounts.set(clientIP, currentCount + 1);

        gifts.set(giftId, {
            message,
            imageUrl,
            theme,
            createdAt: new Date(),
            creatorIP: clientIP
        });

        res.json({ 
            success: true,
            giftId,
            giftUrl: `${req.protocol}://${req.get('host')}/gift/${giftId}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/gift/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'gift.html'));
});

// Try different ports if the default is in use
const findAvailablePort = async (startPort) => {
    let port = startPort;
    while (port < startPort + 10) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port, () => {
                    server.close();
                    resolve();
                }).on('error', () => {
                    port++;
                    resolve();
                });
            });
            return port;
        } catch (err) {
            port++;
        }
    }
    throw new Error('No available ports found');
};

// Start server with available port
findAvailablePort(process.env.PORT || 3005)
    .then(port => {
        app.listen(port, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });

// Cleanup old gifts periodically (every 24 hours)
setInterval(() => {
    const now = new Date();
    const ipCounts = new Map(); // Track current IPs

    for (const [id, gift] of gifts.entries()) {
        // Remove gifts older than 30 days
        if (now - gift.createdAt > 30 * 24 * 60 * 60 * 1000) {
            if (gift.imageUrl) {
                const filePath = path.join(__dirname, 'public', gift.imageUrl);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            gifts.delete(id);
        } else {
            // Count active gifts per IP
            const count = ipCounts.get(gift.creatorIP) || 0;
            ipCounts.set(gift.creatorIP, count + 1);
        }
    }

    // Update IP gift counts with only active gifts
    ipGiftCounts.clear();
    for (const [ip, count] of ipCounts.entries()) {
        ipGiftCounts.set(ip, count);
    }
}, 24 * 60 * 60 * 1000);
  