const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);

    // Proxy /api/* to backend
    if (parsedUrl.pathname.startsWith('/api/')) {
      const backendUrl = `http://localhost:3333${parsedUrl.pathname}`;
      try {
        const response = await fetch(backendUrl, {
          method: req.method,
          headers: { ...req.headers, host: 'backend:3333' },
          body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await collectBody(req) : undefined,
        });

        res.writeHead(response.status, {
          'Content-Type': response.headers.get('content-type') || 'application/json',
        });

        const body = await response.arrayBuffer();
        res.end(Buffer.from(body));
      } catch (err) {
        console.error('Proxy error:', err.message);
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Backend unreachable' }));
      }
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

function collectBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}