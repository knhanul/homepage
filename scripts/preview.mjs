#!/usr/bin/env node
// 로컬 미리보기 서버: node scripts/preview.mjs  →  http://127.0.0.1:8088
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 8088);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(DIST, p));
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    const body = await readFile(join(DIST, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(body);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`미리보기: http://127.0.0.1:${PORT}`));
