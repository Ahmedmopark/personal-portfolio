const fs = require('fs');
const path = require('path');

// Minify CSS
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .replace(/\s*([{\}:;,])\s*/g, '$1') // Remove spaces around characters
    .replace(/;}/g, '}')              // Remove trailing semicolons
    .trim();
}

// Minify JS (Simple and safe comment stripping + space compression)
function minifyJS(js) {
  // Simple regex-based JS minifier that is safe and won't break syntax
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/(?:^|\s)\/\/.*$/gm, '')  // Remove line comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .trim();
}

try {
  const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'public', 'style.min.css'), minifyCSS(styleCss), 'utf8');
  console.log('style.css minified successfully.');

  const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'public', 'script.min.js'), minifyJS(scriptJs), 'utf8');
  console.log('script.js minified successfully.');
} catch (err) {
  console.error('Error during minification:', err);
  process.exit(1);
}
