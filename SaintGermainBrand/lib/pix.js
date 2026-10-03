'use strict';

const { randomUUID } = require('node:crypto');
const catalog = require('../data/catalog.json');

const PIX_DISCOUNT_PERCENT = 20;
const MAX_ITEMS = 30;
const MAX_QUANTITY = 99;

function invalid(message) {
    return { status: 400, body: { error: message } };
}

function validDocument(document) {
    if (/^(\d)\1+$/.test(document)) return false;

    if (document.length === 11) {
        const digit = (length, factor) => {
            const sum = [...document.slice(0, length)].reduce((total, value, index) => {
                return total + Number(value) * (factor - index);
            }, 0);
            const remainder = (sum * 10) % 11;
            return remainder === 10 ? 0 : remainder;
        };
        return digit(9, 10) === Number(document[9]) && digit(10, 11) === Number(document[10]);
    }

    if (document.length === 14) {
        const calculateDigit = (value) => {
            const weights = value.length === 12
                ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
                : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            const sum = [...value].reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
            const remainder = sum % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };
        return calculateDigit(document.slice(0, 12)) === Number(document[12])
            && calculateDigit(document.slice(0, 13)) === Number(document[13]);
    }

    return false;
}

function normalizeClient(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
    const phone = typeof value.phone === 'string' ? value.phone.replace(/\D/g, '') : '';
    const document = typeof value.document === 'string' ? value.document.replace(/\D/g, '') : '';

    if (name.length < 2 || name.length > 120) return null;
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    if (phone.length < 10 || phone.length > 13) return null;
    if (!validDocument(document)) return null;

    return { name, email, phone, document };
}

function applyPixDiscount(subtotalCents) {
    const discountCents = Math.round(subtotalCents * PIX_DISCOUNT_PERCENT / 100);
    return {
        discountCents,
        amountCents: subtotalCents - discountCents,
    };
}

function calculatePixOrder(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { error: invalid('Dados de checkout inválidos.') };
    }
    if (String(payload.paymentMethod || '').toLowerCase() !== 'pix') {
        return { error: invalid('Selecione Pix para criar uma cobrança Pix.') };
    }

    const client = normalizeClient(payload.client);
    if (!client) return { error: invalid('Confira nome, e-mail, telefone e CPF/CNPJ.') };

    if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > MAX_ITEMS) {
        return { error: invalid('O carrinho está vazio ou contém itens demais.') };
    }

    let subtotalCents = 0;
    for (const item of payload.items) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { error: invalid('Um dos itens do pedido é inválido.') };
        }

        const productId = typeof item.productId === 'string' ? item.productId : '';
        const product = catalog[productId];
        if (!product) return { error: invalid('Um produto do carrinho não está disponível.') };
        if (product.available === false) return { error: invalid('Um produto do carrinho está esgotado.') };

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            return { error: invalid('A quantidade de um produto é inválida.') };
        }

        const variantValue = typeof item.variant === 'string' ? item.variant.trim() : '';
        if (product.variants.length) {
            const selectedValue = variantValue.includes(':')
                ? variantValue.slice(variantValue.lastIndexOf(':') + 1).trim()
                : variantValue;
            const hasOption = product.variants.some((group) => group.options.includes(selectedValue));
            if (!hasOption) return { error: invalid('Selecione uma variação válida do produto.') };
        } else if (variantValue) {
            return { error: invalid('Uma variação enviada não pertence ao produto.') };
        }

        subtotalCents += product.priceCents * quantity;
        if (!Number.isSafeInteger(subtotalCents)) return { error: invalid('O valor total do pedido é inválido.') };
    }

    if (subtotalCents < 1) return { error: invalid('O total do pedido precisa ser maior que zero.') };

    const { discountCents, amountCents } = applyPixDiscount(subtotalCents);
    return {
        order: {
            client,
            subtotalCents,
            discountCents,
            amountCents,
        },
    };
}

async function createPixPayment(payload, options = {}) {
    const calculated = calculatePixOrder(payload);
    if (calculated.error) return calculated.error;

    const apiKey = Object.hasOwn(options, 'apiKey') ? options.apiKey : process.env.KOLISEU_API_KEY;
    if (!apiKey) {
        return {
            status: 503,
            body: { error: 'A cobrança Pix não está configurada neste ambiente.' },
        };
    }

    const fetchImpl = options.fetchImpl || globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
        return { status: 500, body: { error: 'O servidor não tem suporte a chamadas HTTP.' } };
    }

    const externalReference = `pedido-${randomUUID()}`;
    const providerPayload = {
        amountCents: calculated.order.amountCents,
        description: `Pedido ${externalReference}`,
        externalReference,
        client: calculated.order.client,
    };

    let response;
    try {
        response = await fetchImpl('https://www.koliseu.cloud/api/v1/pix/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify(providerPayload),
            signal: AbortSignal.timeout(15000),
        });
    } catch (error) {
        return { status: 502, body: { error: 'Não foi possível conectar à API da Koliseu.' } };
    }

    let responseText;
    try {
        responseText = await response.text();
    } catch (error) {
        return { status: 502, body: { error: 'Não foi possível ler a resposta da API da Koliseu.' } };
    }
    let providerResponse = responseText;
    if (responseText) {
        try {
            providerResponse = JSON.parse(responseText);
        } catch (error) {
            providerResponse = responseText.slice(0, 4000);
        }
    } else {
        providerResponse = null;
    }

    if (!response.ok) {
        return {
            status: 502,
            body: {
                error: 'A API da Koliseu recusou a criação da cobrança Pix.',
                providerStatus: response.status,
            },
        };
    }

    return {
        status: response.status === 204 ? 200 : response.status,
        body: {
            externalReference,
            subtotalCents: calculated.order.subtotalCents,
            discountCents: calculated.order.discountCents,
            amountCents: calculated.order.amountCents,
            paymentState: 'created_unconfirmed',
            providerResponse,
        },
    };
}

module.exports = { applyPixDiscount, calculatePixOrder, createPixPayment, normalizeClient };