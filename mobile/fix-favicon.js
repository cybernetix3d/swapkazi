// This is a simple script to fix the favicon.ico error
// Run this script with: node fix-favicon.js

const fs = require('fs');
const path = require('path');

// Create a simple HTML file with a proper favicon reference
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SwapKazi</title>
  <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
<body>
  <h1>SwapKazi</h1>
  <p>Welcome to SwapKazi!</p>
</body>
</html>`;

// Write the HTML file to the web directory
fs.writeFileSync(path.join(__dirname, 'web', 'index.html'), html);

console.log('Created web/index.html with proper favicon reference');

// Copy the favicon.png to favicon.ico
try {
  const faviconPng = fs.readFileSync(path.join(__dirname, 'assets', 'favicon.png'));
  fs.writeFileSync(path.join(__dirname, 'web', 'favicon.ico'), faviconPng);
  console.log('Copied assets/favicon.png to web/favicon.ico');
} catch (error) {
  console.error('Error copying favicon:', error);
}

console.log('Done!');
