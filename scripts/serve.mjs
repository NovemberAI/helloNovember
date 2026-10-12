import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { Readable } from 'node:stream';

try { process.loadEnvFile(new URL('../.env', import.meta.url)); } catch {}
const { POST: joinWaitlist } = await import('../api/waitlist.js');

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/waitlist') {
      if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }).end(); return; }
      const response = await joinWaitlist(new Request(new URL(req.url, 'http://localhost'), { method: 'POST', headers: req.headers, body: Readable.toWeb(req), duplex: 'half' }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : `${root}${sep}`)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
