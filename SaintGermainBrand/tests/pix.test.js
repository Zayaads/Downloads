'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyPixDiscount, calculatePixOrder, createPixPayment } = require('../lib/pix');
const vercelHandler = require('../api/pix');

function validPayload(overrides = {}) {
    return {
        paymentMethod: 'pix',
        client: {
            name: 'Joao Silva',
            email: 'joao@example.com',
            phone: '11999999999',
            document: '52998224725',
        },
        items: [
            { productId: '204483650', quantity: 1, variant: '', priceCents: 1 },
            { productId: '148331626', quantity: 1, variant: '', priceCents: 1 },
        ],
        ...overrides,
    };
}

test('calcula o desconto sobre o subtotal total e ignora preços do navegador', () => {
    const result = calculatePixOrder(validPayload());

    assert.deepEqual(result.order && {
        subtotalCents: result.order.subtotalCents,
        discountCents: result.order.discountCents,
        amountCents: result.order.amountCents,
    }, {
        subtotalCents: 36980,
        discountCents: 7396,
        amountCents: 29584,
    });
});

test('calcula o desconto total sobre todos os itens em centavos', () => {
    const result = calculatePixOrder(validPayload({
        items: [{ productId: '293104014', quantity: 1 }, { productId: '293104014', quantity: 1 }],
    }));

    assert.equal(result.order.subtotalCents, 11980);
    assert.equal(result.order.discountCents, 2396);
    assert.equal(result.order.amountCents, 9584);
});

test('rejeita produto desconhecido, esgotado e variação não cadastrada', () => {
    assert.equal(calculatePixOrder(validPayload({ items: [{ productId: 'nao-existe', quantity: 1 }] })).error.status, 400);
    assert.equal(calculatePixOrder(validPayload({ items: [{ productId: '317830748', quantity: 1 }] })).error.status, 400);
    assert.equal(calculatePixOrder(validPayload({ items: [{ productId: '261582986', quantity: 1, variant: 'Tamanho: XG' }] })).error.status, 400);
});

test('envia valor calculado e cliente normalizado, preservando a resposta da API sem assumir campos', async () => {
    const calls = [];
    const opaqueProviderBody = 'opaque-provider-response';
    const result = await createPixPayment(validPayload(), {
        apiKey: 'test-key-only',
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return {
                ok: true,
                status: 201,
                text: async () => opaqueProviderBody,
            };
        },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://www.koliseu.cloud/api/v1/pix/payments');
    assert.equal(calls[0].options.headers['x-api-key'], 'test-key-only');
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.amountCents, 29584);
    assert.equal(sent.client.phone, '11999999999');
    assert.equal(sent.client.document, '52998224725');
    assert.match(sent.externalReference, /^pedido-[0-9a-f-]{36}$/);
    assert.equal(result.body.providerResponse, opaqueProviderBody);
    assert.equal(result.body.paymentState, 'created_unconfirmed');
});

test('não chama a API sem chave configurada', async () => {
    let called = false;
    const result = await createPixPayment(validPayload(), {
        apiKey: '',
        fetchImpl: async () => { called = true; },
    });

    assert.equal(result.status, 503);
    assert.equal(called, false);
});

test('converte erro HTTP da Koliseu para erro de gateway sem expor corpo arbitrário', async () => {
    const result = await createPixPayment(validPayload(), {
        apiKey: 'test-key-only',
        fetchImpl: async () => ({
            ok: false,
            status: 422,
            text: async () => '{"private":"must not be forwarded"}',
        }),
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.providerStatus, 422);
    assert.equal('providerResponse' in result.body, false);
});

test('a função Vercel permite somente POST', async () => {
    const response = {
        headers: {},
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };

    await vercelHandler({ method: 'GET' }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, 'POST');
});

test('converte R$ 100,00 em R$ 80,00 com o desconto Pix de 20%', () => {
    assert.deepEqual(applyPixDiscount(10000), {
        discountCents: 2000,
        amountCents: 8000,
    });
});

test('aceita uma variação cadastrada e soma todas as unidades', () => {
    const result = calculatePixOrder(validPayload({
        items: [{ productId: '261582986', quantity: 2, variant: 'Tamanho: M' }],
    }));

    assert.equal(result.order.subtotalCents, 21980);
    assert.equal(result.order.discountCents, 4396);
    assert.equal(result.order.amountCents, 17584);
});