const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8787;
const DIST_DIR = path.join(__dirname, 'stock-sim-copy', 'dist');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Try exact file, then with .html, then index.html in directory
  const tryPaths = [
    filePath,
    filePath.endsWith('.html') ? null : filePath + '.html',
    path.join(filePath, 'index.html')
  ].filter(Boolean);

  const tryNextPath = (index) => {
    if (index >= tryPaths.length) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const currentPath = tryPaths[index];
    fs.stat(currentPath, (err, stats) => {
      if (err) {
        tryNextPath(index + 1);
        return;
      }

      if (stats.isDirectory()) {
        tryNextPath(index + 1);
        return;
      }

      fs.readFile(currentPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }

        const ext = path.extname(currentPath);
        const contentTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf'
        };

        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
  };

  tryNextPath(0);
});

server.listen(PORT, () => {
  console.log(`Stock Sim server running at http://localhost:${PORT}`);
});
