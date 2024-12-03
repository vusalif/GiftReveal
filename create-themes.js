const fs = require('fs');
const path = require('path');

// Create themes directory if it doesn't exist
const themesDir = path.join(__dirname, 'public', 'themes');
if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
}

// Create a CSS file with theme patterns
const cssContent = `
.theme-option[data-theme="sweater"] {
    background-color: #2C5530;
    background-image: 
        linear-gradient(135deg, #D64045 25%, transparent 25%),
        linear-gradient(225deg, #D64045 25%, transparent 25%),
        linear-gradient(45deg, #D64045 25%, transparent 25%),
        linear-gradient(315deg, #D64045 25%, transparent 25%);
    background-position: 10px 0, 10px 0, 0 0, 0 0;
    background-size: 20px 20px;
    background-repeat: repeat;
}

.theme-option[data-theme="stars"] {
    background-color: #1a1a2e;
    background-image: 
        radial-gradient(#D64045 2px, transparent 2px),
        radial-gradient(#D64045 2px, transparent 2px);
    background-size: 30px 30px;
    background-position: 0 0, 15px 15px;
}

.theme-option[data-theme="lights"] {
    background-color: #2C5530;
    background-image: 
        linear-gradient(90deg, #D64045 2px, transparent 2px),
        linear-gradient(#D64045 2px, transparent 2px);
    background-size: 30px 30px;
}

.theme-option[data-theme="ribbon"] {
    background: repeating-linear-gradient(
        45deg,
        #2C5530,
        #2C5530 10px,
        #D64045 10px,
        #D64045 20px
    );
}

/* Theme backgrounds for the gift page */
.theme-background[data-theme="sweater"] {
    background-color: #2C5530;
    background-image: 
        linear-gradient(135deg, #D64045 25%, transparent 25%),
        linear-gradient(225deg, #D64045 25%, transparent 25%),
        linear-gradient(45deg, #D64045 25%, transparent 25%),
        linear-gradient(315deg, #D64045 25%, transparent 25%);
    background-position: 40px 0, 40px 0, 0 0, 0 0;
    background-size: 80px 80px;
    background-repeat: repeat;
}

.theme-background[data-theme="stars"] {
    background-color: #1a1a2e;
    background-image: 
        radial-gradient(#D64045 4px, transparent 4px),
        radial-gradient(#D64045 4px, transparent 4px);
    background-size: 60px 60px;
    background-position: 0 0, 30px 30px;
}

.theme-background[data-theme="lights"] {
    background-color: #2C5530;
    background-image: 
        linear-gradient(90deg, #D64045 4px, transparent 4px),
        linear-gradient(#D64045 4px, transparent 4px);
    background-size: 60px 60px;
}

.theme-background[data-theme="ribbon"] {
    background: repeating-linear-gradient(
        45deg,
        #2C5530,
        #2C5530 40px,
        #D64045 40px,
        #D64045 80px
    );
}
`;

// Write the CSS patterns to a file
fs.writeFileSync(path.join(__dirname, 'public', 'themes.css'), cssContent);

console.log('Theme files created successfully!'); 