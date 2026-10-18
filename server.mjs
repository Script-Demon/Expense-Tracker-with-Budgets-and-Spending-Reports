import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(response, status, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/api/health') {
    send(response, 200, JSON.stringify({ ok: true, service: 'expense-tracker-preview' }), 'application/json; charset=utf-8');
    return;
  }

  let requested = decodeURIComponent(requestUrl.pathname);
  if (requested === '/') requested = '/index.html';
  let filePath = path.normalize(path.join(publicDir, requested));
  if (!existsSync(filePath) && !path.extname(requested)) filePath = path.join(publicDir, 'index.html');
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    send(response, 404, 'Not found');
    return;
  }

  try {
    const body = await readFile(filePath);
    const type = contentTypes[path.extname(filePath)] || 'application/octet-stream';
    send(response, 200, body, type);
  } catch {
    send(response, 500, 'Preview server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Expense Tracker preview listening on http://0.0.0.0:${port}`);
});
