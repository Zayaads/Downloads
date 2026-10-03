'use strict';

const { createPixPayment } = require('../lib/pix');

function parseBody(body) {
    if (Buffer.isBuffer(body)) body = body.toString('utf8');
    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch (error) {
            return null;
        }
    }
    return body && typeof body === 'object' ? body : null;
}

module.exports = async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Método não permitido.' });
    }

    const payload = parseBody(request.body);
    if (!payload) return response.status(400).json({ error: 'Corpo JSON inválido.' });

    const result = await createPixPayment(payload);
    return response.status(result.status).json(result.body);
};