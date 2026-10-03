'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createPixPayment } = require('./lib/pix');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const maxBodyBytes = 32 * 1024;
const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

function sendJson(response, status, body) {
    response.writeHead(status, {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
    });
    response.end(JSON.stringify(body));
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        let tooLarge = false;
        const chunks = [];
        request.on('data', (chunk) => {
            size += chunk.length;
            if (size > maxBodyBytes) {
                tooLarge = true;
                return;
            }
            chunks.push(chunk);
        });
        request.on('end', () => {
            if (tooLarge) {
                reject(new Error('body_too_large'));
                return;
            }
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch (error) {
                reject(new Error('invalid_json'));
            }
        });
        request.on('error', reject);
    });
}

async function handlePix(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { error: 'Método não permitido.' });
    }

    let payload;
    try {
        payload = await readJson(request);
    } catch (error) {
        const status = error.message === 'body_too_large' ? 413 : 400;
        return sendJson(response, status, { error: status === 413 ? 'Requisição muito grande.' : 'Corpo JSON inválido.' });
    }

    const result = await createPixPayment(payload);
    return sendJson(response, result.status, result.body);
}

function handleStatic(request, response, pathname) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
    }

    if (pathname.split('/').some((segment) => segment.startsWith('.env')) || pathname === '/server.js') {
        response.writeHead(404).end();
        return;
    }

    const relativePath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const filePath = path.resolve(root, `.${relativePath}`);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end();
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            response.writeHead(404).end();
            return;
        }

        response.writeHead(200, {
            'Content-Length': stats.size,
            'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff',
        });
        if (request.method === 'HEAD') {
            response.end();
            return;
        }
        fs.createReadStream(filePath).pipe(response);
    });
}

http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/api/pix') {
        handlePix(request, response).catch(() => sendJson(response, 500, { error: 'Erro interno ao processar a cobrança Pix.' }));
        return;
    }
    handleStatic(request, response, url.pathname);
}).listen(port, '127.0.0.1', () => {
    process.stdout.write(`Loja local disponível em http://127.0.0.1:${port}\n`);
});