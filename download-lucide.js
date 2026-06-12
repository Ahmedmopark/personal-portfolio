const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://unpkg.com/lucide@0.372.0/dist/umd/lucide.min.js';
const filePath = path.join(__dirname, 'public', 'lucide.min.js');

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download Lucide: status code ${res.statusCode}`);
    process.exit(1);
  }
  const file = fs.createWriteStream(filePath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Lucide Icons minified library downloaded successfully.');
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error downloading Lucide:', err);
  process.exit(1);
});
