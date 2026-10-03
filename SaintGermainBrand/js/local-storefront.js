(() => {
    'use strict';

    const CART_KEY = 'saint-germain-cart-v1';
    const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const storeHosts = new Set([
        'saintgermainbrand.com.br',
        'www.saintgermainbrand.com.br',
        'imobiliariakirchner.lojavirtualnuvem.com.br',
    ]);

    function routeUrl(params = {}) {
        const destination = new URL(window.location.href);
        destination.search = '';
        destination.hash = '';
        Object.entries(params).forEach(([key, value]) => {
            if (value) destination.searchParams.set(key, value);
        });
        return destination.href;
    }

    function navigate(params = {}) {
        window.location.assign(routeUrl(params));
    }

    function readCart() {
        try {
            const entries = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
            if (!Array.isArray(entries)) return [];
            return entries.filter((entry) => entry && typeof entry.id === 'string'
                && typeof entry.name === 'string' && Number.isInteger(entry.priceCents)
                && entry.priceCents >= 0 && Number.isInteger(entry.quantity) && entry.quantity > 0);
        } catch (error) {
            return [];
        }
    }

    function writeCart(entries) {
        try {
            window.localStorage.setItem(CART_KEY, JSON.stringify(entries));
        } catch (error) {
            showNotice('O navegador bloqueou o armazenamento local. Habilite o armazenamento para manter seu carrinho.');
            return false;
        }
        updateCartCount(entries);
        return true;
    }

    function updateCartCount(entries = readCart()) {
        const total = entries.reduce((sum, entry) => sum + entry.quantity, 0);
        document.querySelectorAll('#ajax-cart .js-cart-widget-amount').forEach((badge) => {
            badge.textContent = String(total);
        });
        document.querySelectorAll('[data-local-cart-count]').forEach((badge) => {
            badge.textContent = String(total);
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        })[character]);
    }

    function parseMoney(text) {
        const digits = String(text || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        const amount = Number(digits);
        return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
    }

    function productSlug(card) {
        const productLink = [...card.querySelectorAll('a[href]')].find((link) => {
            try {
                return new URL(link.href, window.location.href).searchParams.has('produto');
            } catch (error) {
                return false;
            }
        });
        if (productLink) {
            return new URL(productLink.href, window.location.href).searchParams.get('produto') || '';
        }
        const productUrl = card.querySelector('[data-product-url]')?.getAttribute('data-product-url');
        return productUrl ? decodeURIComponent(productUrl.split('/').filter(Boolean).pop()) : '';
    }

    function productImage(card) {
        const image = card.querySelector('.js-item-image-primary, .item-image img');
        if (!image) return '';
        const candidates = (image.getAttribute('data-srcset') || image.getAttribute('srcset') || '')
            .split(',').map((candidate) => candidate.trim().split(/\s+/)[0]).filter(Boolean);
        const localCandidate = candidates.find((candidate) => !/^https?:|^\/\//i.test(candidate));
        return localCandidate || image.getAttribute('src') || '';
    }

    function variationSelects(card) {
        return [...card.querySelectorAll('.js-item-variants select[name^="variation"]')];
    }

    function hasSelectableVariants(card) {
        return variationSelects(card).some((select) => select.options.length > 1);
    }

    function selectedVariant(card) {
        return variationSelects(card).map((select) => {
            const group = select.closest('.js-product-variants-group');
            const label = group?.querySelector('.form-label')?.textContent.trim().split(':')[0] || 'Variação';
            return `${label}: ${select.value}`;
        }).filter((value) => !value.endsWith(': ')).join(' / ');
    }

    function productFromForm(form) {
        const card = form.closest('.js-item-product');
        if (!card) return null;
        const priceElement = card.querySelector('[data-product-price], .js-price-display');
        const priceCents = Number(priceElement?.getAttribute('data-product-price')) || parseMoney(priceElement?.textContent);
        const id = form.querySelector('[name="add_to_cart"]')?.value || card.dataset.productId;
        const name = card.querySelector('.js-item-name')?.textContent.trim() || card.querySelector('.item-link')?.textContent.trim();
        if (!id || !name || !priceElement || priceCents < 0) return null;

        const comparePrice = card.querySelector('.js-compare-price-display')?.textContent;
        const quantity = Number(form.querySelector('.js-quantity-input')?.value || 1);
        return {
            id: String(id),
            slug: productSlug(card),
            name,
            priceCents,
            comparePriceCents: parseMoney(comparePrice),
            image: productImage(card),
            variant: selectedVariant(card),
            quantity: Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 999) : 1,
        };
    }

    function productKey(item) {
        return `${item.id}::${item.variant || ''}`;
    }

    function addProduct(item) {
        const entries = readCart();
        const existing = entries.find((entry) => productKey(entry) === productKey(item));
        if (existing) {
            existing.quantity = Math.min(999, existing.quantity + item.quantity);
        } else {
            entries.push(item);
        }
        if (writeCart(entries)) navigate({ pagina: 'carrinho' });
    }

    function showNotice(message) {
        const notice = document.createElement('div');
        notice.className = 'local-store-notice';
        notice.setAttribute('role', 'status');
        notice.textContent = message;
        document.body.appendChild(notice);
        window.setTimeout(() => notice.remove(), 5000);
    }

    function cartTotal(entries) {
        return entries.reduce((sum, entry) => sum + entry.priceCents * entry.quantity, 0);
    }

    function pixTotals(entries) {
        const subtotalCents = cartTotal(entries);
        const discountCents = Math.round(subtotalCents * 20 / 100);
        return {
            subtotalCents,
            discountCents,
            amountCents: subtotalCents - discountCents,
        };
    }

    function productImageMarkup(entry) {
        const image = entry.image
            ? `<img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.name)}" loading="lazy">`
            : '<span class="local-cart-image-placeholder" aria-hidden="true"></span>';
        return entry.slug
            ? `<a class="local-cart-image" href="${routeUrl({ produto: entry.slug })}">${image}</a>`
            : `<span class="local-cart-image">${image}</span>`;
    }

    function cartRows(entries) {
        return entries.map((entry) => {
            const key = escapeHtml(productKey(entry));
            const lineTotal = entry.priceCents * entry.quantity;
            return `<article class="local-cart-item">
                ${productImageMarkup(entry)}
                <div class="local-cart-item-info">
                    <h2>${escapeHtml(entry.name)}</h2>
                    ${entry.variant ? `<p class="local-cart-variant">${escapeHtml(entry.variant)}</p>` : ''}
                    <p class="local-cart-unit">${money.format(entry.priceCents / 100)} cada</p>
                    <button class="local-link-button" type="button" data-cart-action="remove" data-cart-key="${key}">Remover</button>
                </div>
                <div class="local-cart-item-controls">
                    <div class="local-quantity-control" aria-label="Quantidade de ${escapeHtml(entry.name)}">
                        <button type="button" aria-label="Diminuir quantidade" data-cart-action="decrease" data-cart-key="${key}">−</button>
                        <input type="number" min="1" max="999" value="${entry.quantity}" aria-label="Quantidade" data-cart-action="quantity" data-cart-key="${key}">
                        <button type="button" aria-label="Aumentar quantidade" data-cart-action="increase" data-cart-key="${key}">+</button>
                    </div>
                    <strong>${money.format(lineTotal / 100)}</strong>
                </div>
            </article>`;
        }).join('');
    }

    function renderCartPage() {
        const entries = readCart();
        const content = entries.length
            ? `<div class="local-cart-layout">
                <section class="local-cart-lines" aria-label="Produtos no carrinho">${cartRows(entries)}</section>
                <aside class="local-order-summary">
                    <h2>Resumo do pedido</h2>
                    <div class="local-summary-line"><span>Subtotal</span><strong>${money.format(cartTotal(entries) / 100)}</strong></div>
                    <p class="local-checkout-disclaimer">Frete e pagamento serão definidos na próxima etapa.</p>
                    <a class="local-primary-button" href="${routeUrl({ pagina: 'checkout' })}">Finalizar compra</a>
                </aside>
            </div>`
            : `<div class="local-empty-cart">
                <p>Seu carrinho está vazio.</p>
                <a class="local-primary-button" href="${routeUrl()}">Continuar comprando</a>
            </div>`;
        renderRoute('Carrinho', `<a class="local-back-link" href="${routeUrl()}">Continuar comprando</a>${content}`);
    }

    function renderCheckoutPage() {
        const entries = readCart();
        const totals = pixTotals(entries);
        const emptyMessage = `<section class="local-empty-cart"><p>Adicione produtos antes de seguir para o checkout.</p><a class="local-primary-button" href="${routeUrl()}">Ver produtos</a></section>`;
        const content = entries.length ? `<div class="local-checkout-layout">
            <section class="local-checkout-form-section">
                <a class="local-back-link" href="${routeUrl({ pagina: 'carrinho' })}">Voltar ao carrinho</a>
                <h2>Dados para entrega</h2>
                <form class="local-checkout-form" id="local-checkout-form">
                    <label>Nome completo<input name="name" autocomplete="name" required></label>
                    <div class="local-form-row">
                        <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
                        <label>Telefone<input type="tel" name="phone" autocomplete="tel" required></label>
                    </div>
                    <label>CPF ou CNPJ<input name="document" inputmode="numeric" autocomplete="off" minlength="11" maxlength="18" required></label>
                    <div class="local-form-row">
                        <label>CEP<input name="postalCode" autocomplete="postal-code" required></label>
                        <label>Número<input name="number" autocomplete="address-line2" required></label>
                    </div>
                    <label>Endereço<input name="address" autocomplete="street-address" required></label>
                    <div class="local-form-row">
                        <label>Bairro<input name="neighborhood" required></label>
                        <label>Complemento<input name="complement" autocomplete="address-line2"></label>
                    </div>
                    <div class="local-form-row">
                        <label>Cidade<input name="city" autocomplete="address-level2" required></label>
                        <label>Estado<input name="state" autocomplete="address-level1" maxlength="2" required></label>
                    </div>
                    <fieldset class="local-payment-method">
                        <legend>Forma de pagamento</legend>
                        <label><input type="radio" name="paymentMethod" value="pix" checked required><span>Pix <strong>20% OFF</strong></span></label>
                        <label><input type="radio" name="paymentMethod" value="credit"><span>Cartão de crédito</span></label>
                        <label><input type="radio" name="paymentMethod" value="debit"><span>Cartão de débito</span></label>
                    </fieldset>
                    <div class="local-card-unavailable" id="local-card-unavailable" hidden>
                        <div class="local-card-preview" aria-label="Prévia desabilitada do formulário de cartão">
                            <div class="local-card-preview-field" aria-disabled="true">
                                <span>Número do cartão</span>
                                <div>•••• •••• •••• ••••</div>
                            </div>
                            <div class="local-card-preview-field" aria-disabled="true">
                                <span>Nome impresso no cartão</span>
                                <div>NOME NO CARTÃO</div>
                            </div>
                            <div class="local-card-preview-field" aria-disabled="true">
                                <span>Validade MM/AA</span>
                                <div>MM/AA</div>
                            </div>
                            <div class="local-card-preview-field" aria-disabled="true">
                                <span>CVV</span>
                                <div>•••</div>
                            </div>
                        </div>
                        <div class="local-card-unavailable-message" role="status" aria-live="polite">
                            <p>Pagamento com cartão indisponível no momento.</p>
                            <strong>Finalize agora via Pix e ganhe 20% de desconto.</strong>
                            <button class="local-primary-button" id="local-pay-with-pix" type="button">Pagar com Pix — 20% OFF</button>
                        </div>
                    </div>
                    <p class="local-checkout-notice" id="local-pix-notice">O desconto de Pix será recalculado pelo servidor. A criação da cobrança não confirma o pagamento.</p>
                    <button class="local-primary-button" id="local-checkout-submit" type="submit">Gerar cobrança Pix</button>
                    <p class="local-checkout-result" id="local-checkout-result" role="status" aria-live="polite" hidden></p>
                    <details class="local-provider-response" id="local-provider-response" hidden>
                        <summary>Resposta original da Koliseu</summary>
                        <pre></pre>
                    </details>
                </form>
            </section>
            <aside class="local-order-summary">
                <h2>Seu pedido</h2>
                ${entries.map((entry) => `<div class="local-checkout-product"><span>${escapeHtml(entry.name)}${entry.variant ? ` (${escapeHtml(entry.variant)})` : ''} × ${entry.quantity}</span><strong>${money.format(entry.priceCents * entry.quantity / 100)}</strong></div>`).join('')}
                <div class="local-summary-line"><span>Subtotal</span><strong data-pix-subtotal>${money.format(totals.subtotalCents / 100)}</strong></div>
                <div id="local-pix-pricing">
                    <div class="local-summary-line"><span>Desconto Pix (20%)</span><strong data-pix-discount>−${money.format(totals.discountCents / 100)}</strong></div>
                    <div class="local-summary-line local-checkout-total"><span>Total no Pix</span><strong data-pix-total>${money.format(totals.amountCents / 100)}</strong></div>
                </div>
            </aside>
        </div>` : emptyMessage;
        renderRoute('Checkout', content);
        const form = document.querySelector('#local-checkout-form');
        if (!form) return;

        const submitButton = form.querySelector('#local-checkout-submit');
        const cardUnavailable = form.querySelector('#local-card-unavailable');
        const pixNotice = form.querySelector('#local-pix-notice');
        const pixPricing = document.querySelector('#local-pix-pricing');
        let pixChargeCreated = false;

        const updatePaymentSelection = () => {
            const selectedMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value;
            const pixSelected = selectedMethod === 'pix';
            cardUnavailable.hidden = pixSelected;
            pixNotice.hidden = !pixSelected;
            pixPricing.hidden = !pixSelected;
            submitButton.disabled = !pixSelected || pixChargeCreated;
            submitButton.textContent = pixChargeCreated
                ? 'Cobrança solicitada'
                : pixSelected ? 'Gerar cobrança Pix' : 'Cartão indisponível';
        };

        form.querySelectorAll('input[name="paymentMethod"]').forEach((option) => {
            option.addEventListener('change', updatePaymentSelection);
        });
        form.querySelector('#local-pay-with-pix').addEventListener('click', () => {
            form.querySelector('input[name="paymentMethod"][value="pix"]').checked = true;
            updatePaymentSelection();
        });
        updatePaymentSelection();

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value;
            if (paymentMethod !== 'pix') {
                cardUnavailable.hidden = false;
                return;
            }
            if (!form.reportValidity()) return;
            const result = document.querySelector('#local-checkout-result');
            const client = Object.fromEntries(new FormData(form).entries());
            submitButton.disabled = true;
            submitButton.textContent = 'Solicitando cobrança...';
            result.hidden = false;
            result.textContent = 'Enviando o pedido para validação segura.';

            fetch('/api/pix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod: client.paymentMethod,
                    client: {
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        document: client.document,
                    },
                    items: entries.map((entry) => ({
                        productId: entry.id,
                        quantity: entry.quantity,
                        variant: entry.variant,
                    })),
                }),
            }).then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || 'Não foi possível criar a cobrança Pix.');

                document.querySelector('[data-pix-subtotal]').textContent = money.format(data.subtotalCents / 100);
                document.querySelector('[data-pix-discount]').textContent = `−${money.format(data.discountCents / 100)}`;
                document.querySelector('[data-pix-total]').textContent = money.format(data.amountCents / 100);
                result.textContent = `A Koliseu aceitou a solicitação da cobrança. Referência: ${data.externalReference}. Total recalculado pelo servidor: ${money.format(data.amountCents / 100)}. O pagamento ainda não foi confirmado.`;
                const providerResponse = document.querySelector('#local-provider-response');
                providerResponse.querySelector('pre').textContent = JSON.stringify(data.providerResponse, null, 2) ?? 'null';
                providerResponse.hidden = data.providerResponse === null || data.providerResponse === undefined;
                pixChargeCreated = true;
                updatePaymentSelection();
            }).catch((error) => {
                result.textContent = error.message;
                updatePaymentSelection();
            });
        });
    }

    function renderRoute(title, content) {
        const previousRoute = document.querySelector('#local-store-route');
        if (previousRoute) previousRoute.remove();
        const route = document.createElement('main');
        route.id = 'local-store-route';
        route.className = 'local-store-route';
        route.innerHTML = `<div class="local-store-shell"><p class="local-store-kicker">Saint Germain</p><h1>${escapeHtml(title)}</h1>${content}</div>`;
        document.body.classList.add('local-store-route-active');
        document.body.appendChild(route);
        document.title = `${title} | Saint Germain`;
    }

    function localCommerceHref(rawHref) {
        let target;
        try {
            target = new URL(rawHref, window.location.href);
        } catch (error) {
            return null;
        }

        const path = decodeURIComponent(target.pathname).replace(/\/+$/, '') || '/';
        if (/^\/comprar(?:\/|$)/i.test(path)) return routeUrl({ pagina: 'carrinho' });
        const productMatch = path.match(/^\/produtos?\/([^/]+)/i);
        if (productMatch) return routeUrl({ produto: productMatch[1] });

        const isStoreHost = storeHosts.has(target.hostname.toLowerCase());
        if (isStoreHost && (path === '/' || path === '/index.html')) return routeUrl();
        if (isStoreHost && /^\/(?:relogios|óculos|oculos|joias|joias-lancamentos|presentes|sale|best-seller)(?:\/|$)/i.test(path)) {
            const sections = path.split('/').filter(Boolean);
            const category = sections.length > 1 ? sections.slice(1).join('-') : sections[0];
            return routeUrl({ categoria: category });
        }
        if (isStoreHost && /^\/(?:lancamentos|best-sellers)(?:\/|$)/i.test(path)) {
            return routeUrl({ categoria: path.split('/').filter(Boolean).join('-') });
        }
        return null;
    }

    function localizeLinks(root = document) {
        root.querySelectorAll?.('a[href]').forEach((link) => {
            const internalHref = localCommerceHref(link.getAttribute('href'));
            if (!internalHref) return;
            link.href = internalHref;
            link.removeAttribute('target');
            link.removeAttribute('rel');
        });
        root.querySelectorAll?.('form.js-product-form, form.js-ajax-cart-panel').forEach((form) => {
            form.action = routeUrl({ pagina: 'carrinho' });
            form.method = 'get';
        });
        const cartLink = document.querySelector('#ajax-cart a');
        if (cartLink) {
            cartLink.href = routeUrl({ pagina: 'carrinho' });
            cartLink.setAttribute('aria-label', 'Abrir carrinho');
        }
    }

    function activateProductVariants() {
        const route = document.querySelector('#local-product-route');
        if (!route) return;
        const productContent = route.querySelector('.item');
        if (productContent && !productContent.closest('.js-item-product')) {
            productContent.classList.add('js-item-product');
            productContent.dataset.productId = productContent.querySelector('[name="add_to_cart"]')?.value || '';
        }
        route.querySelectorAll('.js-item-variants.hidden').forEach((container) => container.classList.remove('hidden'));
        route.querySelectorAll('.js-item-variants .js-product-variants-group .js-insta-variant').forEach((option) => {
            option.setAttribute('role', 'button');
            option.setAttribute('aria-pressed', option.classList.contains('selected') ? 'true' : 'false');
        });
    }

    function hydrateHomeImages(root) {
        root.querySelectorAll('img[src], img[srcset], img[data-src], img[data-srcset]').forEach((image) => {
            const source = image.getAttribute('data-src');
            const sourceSet = image.getAttribute('data-srcset');
            const revealLoadedImage = () => {
                if (image.naturalWidth < 2) return;
                image.classList.add('lazyloaded');
                image.classList.remove('lazyload');
            };

            image.addEventListener('load', revealLoadedImage, { once: true });
            if (source && (!image.getAttribute('src') || image.getAttribute('src').includes('empty-placeholder'))) {
                image.setAttribute('src', source);
            }
            if (sourceSet) image.setAttribute('srcset', sourceSet);

            if (image.closest('.js-item-product')) {
                image.setAttribute('sizes', '(max-width: 767px) 50vw, 20vw');
            } else if (image.closest('.js-home-category')) {
                image.setAttribute('sizes', '84px');
            } else if (image.matches('.js-slider-image, .js-textbanner-image')) {
                image.setAttribute('sizes', '100vw');
            } else if (image.dataset.sizes === 'auto') {
                image.setAttribute('sizes', '100vw');
            }

            image.removeAttribute('data-src');
            image.removeAttribute('data-srcset');
            revealLoadedImage();
        });
    }

    function ensureDesktopVideoPoster(home) {
        if (window.innerWidth < 768 || home.querySelector('.local-home-video-poster')) return;
        const container = home.querySelector('.js-home-video-container');
        if (!container) return;

        const poster = document.createElement('img');
        poster.className = 'local-home-video-poster';
        poster.src = 'images/maxresdefault.webp';
        poster.alt = '';
        poster.setAttribute('aria-hidden', 'true');
        poster.fetchPriority = 'high';
        poster.addEventListener('load', () => poster.classList.add('lazyloaded'), { once: true });
        const player = container.querySelector('.js-home-video');
        container.insertBefore(poster, player || container.firstChild);
        if (poster.complete && poster.naturalWidth > 1) poster.classList.add('lazyloaded');
    }

    function initializeHomeCarousels() {
        if (document.body.classList.contains('local-store-route-active')
            || document.body.classList.contains('local-product-route-active')) return;

        const home = document.querySelector('.js-home-sections-container');
        const SwiperConstructor = window.Swiper;
        if (!home) return;

        ensureDesktopVideoPoster(home);
        hydrateHomeImages(home);
        if (typeof SwiperConstructor !== 'function') return;

        const carousels = [
            {
                selector: '.js-home-slider',
                options: (element) => ({
                    loop: true,
                    lazy: true,
                    autoplay: { delay: 6000 },
                    pagination: { el: element.querySelector('.js-swiper-home-pagination'), clickable: true },
                    navigation: {
                        nextEl: element.querySelector('.js-swiper-home-next'),
                        prevEl: element.querySelector('.js-swiper-home-prev'),
                    },
                }),
            },
            {
                selector: '.js-home-slider-mobile',
                options: (element) => ({
                    loop: true,
                    lazy: true,
                    pagination: { el: element.querySelector('.js-swiper-home-pagination-mobile'), clickable: true },
                    navigation: {
                        nextEl: element.querySelector('.js-swiper-home-next-mobile'),
                        prevEl: element.querySelector('.js-swiper-home-prev-mobile'),
                    },
                }),
            },
            {
                selector: '.js-swiper-categories',
                options: (element) => ({
                    loop: true,
                    lazy: true,
                    watchOverflow: true,
                    centeredSlides: true,
                    slidesPerView: 2.2,
                    spaceBetween: 20,
                    navigation: {
                        nextEl: element.closest('section')?.querySelector('.js-swiper-categories-next'),
                        prevEl: element.closest('section')?.querySelector('.js-swiper-categories-prev'),
                    },
                    breakpoints: {
                        768: { loop: false, centeredSlides: false, slidesPerView: 'auto' },
                    },
                }),
            },
            {
                selector: '.js-swiper-new',
                options: (element) => ({
                    loop: true,
                    lazy: true,
                    watchOverflow: true,
                    slidesPerView: 2.25,
                    spaceBetween: 16,
                    navigation: {
                        nextEl: element.closest('section')?.querySelector('.js-swiper-new-next'),
                        prevEl: element.closest('section')?.querySelector('.js-swiper-new-prev'),
                    },
                    breakpoints: { 768: { slidesPerView: 5 } },
                }),
            },
            {
                selector: '.js-swiper-promotion',
                options: (element) => ({
                    loop: true,
                    lazy: true,
                    watchOverflow: true,
                    slidesPerView: 2.25,
                    spaceBetween: 16,
                    navigation: {
                        nextEl: element.closest('section')?.querySelector('.js-swiper-promotion-next'),
                        prevEl: element.closest('section')?.querySelector('.js-swiper-promotion-prev'),
                    },
                    breakpoints: { 768: { slidesPerView: 5 } },
                }),
            },
        ];

        carousels.forEach(({ selector, options }) => {
            home.querySelectorAll(selector).forEach((element) => {
                if (element.swiper || element.getBoundingClientRect().width < 1) return;
                try {
                    new SwiperConstructor(element, options(element));
                } catch (error) {
                    element.classList.add('local-carousel-fallback');
                }
            });
        });

        hydrateHomeImages(home);
    }

    function applyCategory(category) {
        const cards = [...document.querySelectorAll('.js-item-product[data-product-id]')];
        const label = category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        const matchers = {
            relogios: /rel[oó]gio/i,
            'relogio-feminino': /feminino/i,
            'relogio-masculino': /masculino/i,
            'relogios-mini': /mini|minimalista/i,
            vintage: /vintage/i,
            dourado: /dourad|gold/i,
            'rose-gold': /ros[eé]|rose|rosé/i,
            prata: /prata|silver/i,
            preto: /preto|black/i,
            couro: /couro|leather/i,
            quadrados: /quadrad|square/i,
            cronografo: /cron[oó]grafo|seconds/i,
            'relogios-bicolor': /bicolor|bi.?color/i,
            'relogio-de-pulso': /rel[oó]gio/i,
            'relogio-infantil': /infantil|kids/i,
            'porta-relogio': /porta.?rel[oó]gio|estojo|watch box/i,
            sale: /./,
            lancamentos: /rel[oó]gio/i,
            'best-sellers': /rel[oó]gio/i,
            'best-seller': /rel[oó]gio|[óo]culos/i,
            oculos: /[óo]culos/i,
            'oculos-de-sol': /[óo]culos de sol/i,
            'oculos-de-grau': /[óo]culos de grau/i,
            joias: /anel|brinco|colar|joia|pulseira/i,
            'joias-femininas': /anel|brinco|colar|pulseira|joia/i,
            'joias-masculinas': /anel|colar|pulseira|joia/i,
            presentes: /./,
            'presente-para-mulher': /feminino|mulher|anel|brinco|colar|pulseira/i,
            'presente-para-homem': /masculino|homem|relogio/i,
        };
        const normalizedCategory = category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const matcher = matchers[category] || (normalizedCategory.includes('colecao')
            ? new RegExp(normalizedCategory.split('-').filter((part) => part !== 'colecao' && part !== 'colecoes').join('|'), 'i')
            : normalizedCategory.startsWith('oculos') ? /[óo]culos/i
                : normalizedCategory.startsWith('joias') ? /anel|brinco|colar|joia|pulseira/i
                    : normalizedCategory.startsWith('presente') ? /./
                        : new RegExp(normalizedCategory.replace(/-/g, '|'), 'i'));
        const selectedCards = cards.filter((card) => matcher.test(card.querySelector('.js-item-name')?.textContent || ''));
        const productsToShow = selectedCards.length ? selectedCards : cards;
        const content = productsToShow.length
            ? `<div class="local-product-grid">${productsToShow.map((card) => `<article class="js-item-product local-product-card" data-product-id="${escapeHtml(card.dataset.productId)}">${card.querySelector('.item')?.outerHTML || ''}</article>`).join('')}</div>`
            : '<p class="local-empty-cart">Não encontramos produtos nesta categoria.</p>';
        renderRoute(label, `<a class="local-back-link" href="${routeUrl()}">Ver todos os produtos</a>${content}`);
    }

    function changeQuantity(key, quantity) {
        const entries = readCart();
        const entry = entries.find((item) => productKey(item) === key);
        if (!entry) return;
        entry.quantity = Math.max(1, Math.min(999, quantity));
        if (writeCart(entries) && new URLSearchParams(window.location.search).get('pagina') === 'carrinho') {
            renderCartPage();
        }
    }

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        const cartLink = target.closest('#ajax-cart a');
        if (cartLink) {
            event.preventDefault();
            event.stopImmediatePropagation();
            navigate({ pagina: 'carrinho' });
            return;
        }

        const cartAction = target.closest('[data-cart-action="remove"], [data-cart-action="increase"], [data-cart-action="decrease"]');
        if (cartAction) {
            event.preventDefault();
            const key = cartAction.dataset.cartKey;
            const entries = readCart();
            if (cartAction.dataset.cartAction === 'remove') {
                writeCart(entries.filter((entry) => productKey(entry) !== key));
                renderCartPage();
            } else {
                const entry = entries.find((item) => productKey(item) === key);
                if (entry) changeQuantity(key, entry.quantity + (cartAction.dataset.cartAction === 'increase' ? 1 : -1));
            }
            return;
        }

        const quickShop = target.closest('.js-quickshop-modal-open');
        if (quickShop) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const slug = productSlug(quickShop.closest('.js-item-product'));
            if (slug) navigate({ produto: slug });
            return;
        }

        const productLink = target.closest('a[href*="produto="]');
        if (productLink && !target.closest('.js-addtocart, .js-prod-submit-form')) {
            const destination = new URL(productLink.href, window.location.href);
            const slug = destination.searchParams.get('produto');
            if (slug) {
                event.preventDefault();
                event.stopImmediatePropagation();
                navigate({ produto: slug });
                return;
            }
        }

        const variantOption = target.closest('.js-insta-variant');
        if (variantOption && variantOption.closest('#local-product-route')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const group = variantOption.closest('.js-product-variants-group');
            const select = group?.querySelector('select[name^="variation"]');
            const selectedValue = variantOption.dataset.option;
            if (select && selectedValue !== undefined) {
                select.value = selectedValue;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                group.querySelectorAll('.js-insta-variant').forEach((option) => {
                    const selected = option === variantOption;
                    option.classList.toggle('selected', selected);
                    option.setAttribute('aria-pressed', selected ? 'true' : 'false');
                });
                const label = group.querySelector('.js-insta-variation-label');
                if (label) label.textContent = selectedValue;
            }
            return;
        }

        const control = target.closest('.js-addtocart, .js-prod-submit-form');
        if (!control || control.classList.contains('disabled') || control.disabled) return;
        const form = control.closest('form.js-product-form');
        if (!form) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const card = form.closest('.js-item-product');
        if (!card) return;
        if (hasSelectableVariants(card) && !card.closest('#local-product-route')) {
            const slug = productSlug(card);
            if (slug) navigate({ produto: slug });
            else showNotice('Abra a página do produto para selecionar uma variação.');
            return;
        }
        const item = productFromForm(form);
        if (item) addProduct(item);
        else showNotice('Não foi possível identificar os dados deste produto.');
    }, true);

    document.addEventListener('submit', (event) => {
        const form = event.target instanceof HTMLFormElement ? event.target : null;
        if (!form?.matches('form.js-product-form')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const card = form.closest('.js-item-product');
        if (card && hasSelectableVariants(card) && !card.closest('#local-product-route')) {
            const slug = productSlug(card);
            if (slug) navigate({ produto: slug });
            return;
        }
        const item = productFromForm(form);
        if (item) addProduct(item);
    }, true);

    document.addEventListener('change', (event) => {
        const input = event.target instanceof HTMLInputElement ? event.target : null;
        if (input?.dataset.cartAction === 'quantity') {
            changeQuantity(input.dataset.cartKey, Number(input.value) || 1);
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const quantityControl = target?.closest('#local-product-route .js-quantity-up, #local-product-route .js-quantity-down');
        if (!quantityControl) return;
        event.preventDefault();
        const input = quantityControl.closest('.js-quantity')?.querySelector('.js-quantity-input');
        if (input) input.value = String(Math.max(1, Number(input.value || 1) + (quantityControl.classList.contains('js-quantity-up') ? 1 : -1)));
    }, true);

    const observer = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            localizeLinks(node);
        }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    localizeLinks();
    updateCartCount();
    activateProductVariants();

    const query = new URLSearchParams(window.location.search);
    const page = query.get('pagina');
    if (page === 'carrinho') renderCartPage();
    if (page === 'checkout') renderCheckoutPage();
    if (query.has('categoria')) applyCategory(query.get('categoria'));

    initializeHomeCarousels();
    window.addEventListener('load', initializeHomeCarousels, { once: true });
    window.addEventListener('resize', initializeHomeCarousels);
})();