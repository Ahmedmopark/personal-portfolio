const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Helper to remove directory recursively
function cleanDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Helper to copy directory recursively
function copyDirSync(src, dest, excludeFiles = []) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (excludeFiles.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, excludeFiles);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// CSS Minifier
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .replace(/\s*([{\}:;,])\s*/g, '$1') // Remove spaces around characters
    .replace(/;}/g, '}')              // Remove trailing semicolons
    .trim();
}

// JS Minifier
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/(?:^|\s)\/\/.*$/gm, '')  // Remove line comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .trim();
}

// HTML Minifier (safe & simple)
function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ')            // Collapse consecutive whitespace
    .replace(/>\s+</g, '><')          // Remove spaces between tags
    .trim();
}

// Helper to parse key="value" attributes
function parseAttributes(attrStr) {
  const attrs = {};
  const regex = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const key = match[1];
    const val = match[2] || match[3] || match[4] || '';
    attrs[key] = val;
  }
  return attrs;
}

// Inline data-lucide icons into HTML content
function inlineIconsInHtml(htmlContent, fileName) {
  // Match <i ... data-lucide="icon-name" ...></i> or <i ... data-lucide="icon-name" ... />
  const iconRegex = /<i\s+([^>]*?data-lucide=["']([^"']+)["']?[^>]*?)(?:\/>|><\/i>)/gi;
  let matchCount = 0;

  const inlined = htmlContent.replace(iconRegex, (match, fullAttrStr, iconName) => {
    const attributes = parseAttributes(fullAttrStr);
    const cleanIconName = iconName.trim();
    const svgPath = path.join(__dirname, 'node_modules', 'lucide-static', 'icons', `${cleanIconName}.svg`);

    if (!fs.existsSync(svgPath)) {
      console.warn(`  [Warning] Icon "${cleanIconName}" not found at ${svgPath} in ${fileName}`);
      return match; // Return unchanged if not found
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const svgStartRegex = /<svg([^>]*?)>/i;
    const svgStartMatch = svgContent.match(svgStartRegex);
    
    if (!svgStartMatch) {
      return match;
    }

    const svgAttributes = parseAttributes(svgStartMatch[1]);

    // Merge classes: svg classes + i classes
    const svgClass = svgAttributes.class || '';
    const iClass = attributes.class || '';
    const mergedClass = `${svgClass} ${iClass}`.replace(/\s+/g, ' ').trim();

    // Merge other attributes, i tag overrides svg
    const mergedAttributes = { ...svgAttributes, ...attributes };
    // Keep data-lucide attribute so JavaScript selectors still function
    mergedAttributes.class = mergedClass;

    // Convert attributes object back to string
    const attrString = Object.entries(mergedAttributes)
      .map(([key, val]) => `${key}="${val}"`)
      .join(' ');

    const newSvgContent = svgContent.replace(svgStartRegex, `<svg ${attrString}>`);
    matchCount++;
    return newSvgContent;
  });

  return { content: inlined, count: matchCount };
}

// Strip the lucide.min.js script tag
function stripLucideScript(htmlContent) {
  const scriptRegex = /<script\s+[^>]*?src=["'][^"']*?lucide\.min\.js[^"']*?["'][^>]*?><\/script>/gi;
  return htmlContent.replace(scriptRegex, '');
}

async function build() {
  console.log('=== Starting Optimized Build Process ===');

  // 1. Run Tailwind
  console.log('1. Compiling and minifying Tailwind CSS...');
  try {
    execSync('npx tailwindcss -i ./tailwind-input.css -o ./public/tailwind.min.css --minify', { stdio: 'inherit' });
  } catch (err) {
    console.error('Tailwind compilation failed:', err);
    process.exit(1);
  }

  // 2. Minify custom styles and scripts
  console.log('2. Minifying custom style.css & script.js...');
  try {
    const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'style.min.css'), minifyCSS(styleCss), 'utf8');

    const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'script.min.js'), minifyJS(scriptJs), 'utf8');
    console.log('  Minified style.css and script.js successfully.');
  } catch (err) {
    console.error('Minification of source styles/scripts failed:', err);
    process.exit(1);
  }

  // 3. Clean and recreate dist directory
  console.log('3. Preparing dist/ directory...');
  cleanDirSync(DIST_DIR);
  fs.mkdirSync(DIST_DIR);

  // 4. Copy public directory (excluding lucide.min.js and unminified files)
  console.log('4. Copying assets to dist/public/...');
  copyDirSync(PUBLIC_DIR, path.join(DIST_DIR, 'public'), ['lucide.min.js']);

  // 5. Copy root config and favicon files
  console.log('5. Copying root config and favicon files to dist/...');
  const filesToCopy = [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.png',
    '_headers',
    '_redirects'
  ];
  for (const file of filesToCopy) {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(DIST_DIR, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 6. Inline Lucide Icons in HTML files and write to dist/
  console.log('6. Processing HTML files (Inlining icons & removing Lucide script)...');
  const files = fs.readdirSync(__dirname);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  let totalInlinedIcons = 0;
  for (const htmlFile of htmlFiles) {
    const filePath = path.join(__dirname, htmlFile);
    let content = fs.readFileSync(filePath, 'utf8');

    // Inline the icons
    const inlineResult = inlineIconsInHtml(content, htmlFile);
    content = inlineResult.content;
    totalInlinedIcons += inlineResult.count;

    // Strip Lucide script tag
    content = stripLucideScript(content);

    // Minify HTML content
    content = minifyHTML(content);

    // Save optimized HTML inside dist/
    fs.writeFileSync(path.join(DIST_DIR, htmlFile), content, 'utf8');
    console.log(`  Processed ${htmlFile}: inlined ${inlineResult.count} icons.`);
  }

  console.log(`\n=== Build Completed Successfully! ===`);
  console.log(`- Deployed Output: dist/`);
  console.log(`- Total Icons Inlined: ${totalInlinedIcons}`);
  console.log(`- Eliminated JS Overhead: lucide.min.js (328KB) completely removed!`);
}

build();
