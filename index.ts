import { readFile } from 'fs/promises';
import { join, extname } from 'path';

const BASE_PATH = './dist';
const ASSETS_PATH = 'assets'; // Define the assets directory name
const DEFAULT_FILE = 'index.html';
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  // Add other MIME types as needed
};

const server = Bun.serve({
  port: 3002,

  async fetch(req) {
    let path = new URL(req.url).pathname;
    console.log(path);

    // Default to index.html if the root is requested
    if (path === '/') {
      path = '/' + DEFAULT_FILE;
    }

    const filePath = join(BASE_PATH, path);
    try {
      const file = await readFile(filePath);
      const extension = extname(filePath);
      const mimeType = MIME_TYPES[extension] || 'text/plain';

      return new Response(file, {
        headers: { 'Content-Type': mimeType },
      });
    } catch (err) {
      // File not found or error reading file
      return new Response('Not Found', { status: 404 });
    }
  }
});

console.log(`Listening on http://localhost:${server.port}`);
