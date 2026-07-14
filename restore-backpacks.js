const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\rohit\\.gemini\\antigravity\\brain\\8ed6dbff-82d6-409c-8c7b-82250076d40c';
const destDir = path.join(__dirname, 'public', 'images', 'products');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);
files.forEach(file => {
    if (file.startsWith('backpack') && file.endsWith('.png')) {
        // Extract the number, e.g. backpack11_123.png -> backpack11.jpg
        const match = file.match(/^(backpack\d+)/);
        if (match) {
            const destName = match[1] + '.jpg';
            const srcPath = path.join(brainDir, file);
            const destPath = path.join(destDir, destName);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Restored: ${file} -> ${destName}`);
        }
    }
});
