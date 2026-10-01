/**
 * @typedef {Object} item
 *   @property {string} product_titles - Product name
 *   @property {int} product_ids - Parent product ID
 *   @property {int} variant_id - Product ID
 *   @property {string} product_urls - Product permalink
 *   @property {string} product_images - Product image url
 *   @property {array} categories - Product categories (array of strings)
 */
window._edrone = window._edrone || {};
const doc = document.createElement('script');
doc.type = 'text/javascript';
doc.async = true;
doc.src = ('https:' == document.location.protocol ? 'https:' : 'http:') + '//d3bo67muzbfgtl.cloudfront.net/edrone_2_0.js?app_id';
const s = document.getElementsByTagName('script')[0];
s.parentNode.insertBefore(doc, s);

setTimeout(() => {
	let lastEventType, lastEventContent, addToCartSent;
	if (!window.edroneMetadata) {
		return;
	}

	const productPage = document.querySelector('body.single-product');
	const orderPage = document.querySelector('.woocommerce-order-received');
	const SUBSCRIBE_CAPTURE_RETRY_DELAY_MS = 500;
	const SUBSCRIBE_CAPTURE_MAX_RETRIES = 10;
	let legacySubscribeFallbackInitialized = false;
	let subscribeCaptureInitRequested = false;

	const createEventSnapshot = () => ({
		action_type: _edrone.action_type || '',
		product_ids: _edrone.product_ids || '',
		product_variant_ids: _edrone.product_variant_ids || '',
		email: _edrone.email || '',
		first_name: _edrone.first_name || '',
		last_name: _edrone.last_name || '',
		phone: _edrone.phone || '',
		customer_tags: _edrone.customer_tags || '',
		subscriber_status: _edrone.subscriber_status || '',
		sms_subscriber_status: _edrone.sms_subscriber_status || '',
		order_id: _edrone.order_id || ''
	});

	const setupLegacySubscribeFallback = () => {
		if (legacySubscribeFallbackInitialized) {
			return;
		}

		const newsletterForm = document.querySelector('form[action*="newsletter"]');
		if (!newsletterForm) {
			return;
		}

		legacySubscribeFallbackInitialized = true;

		const sendLegacySubscribe = () => {
			const email = newsletterForm.querySelector('[name*="email"]')?.value;
			if (!email) {
				return;
			}

			_edrone.email = email;
			_edrone.action_type = 'subscribe';
			_edrone.customer_tags = 'Footer';
			_edrone.subscriber_status = 1;

			const firstName = newsletterForm.querySelector('[name*="name"]')?.value;
			if (firstName) {
				_edrone.first_name = firstName;
			}

			_edrone.init();
		};

		newsletterForm.addEventListener('submit', sendLegacySubscribe, true);
		newsletterForm.addEventListener('click', function (event) {
			if (event.target.closest('[type="submit"]')) {
				sendLegacySubscribe();
			}
		}, true);
	};

	const updateInit = () => {
		if (typeof _edrone.init === 'function') {
			const oldInit = _edrone.init;
			_edrone.init = () => {
				const currentEventContent = createEventSnapshot();
				const isSameSnapshot =
					lastEventContent &&
					Object.keys(currentEventContent).every((key) => currentEventContent[key] === lastEventContent[key]);
				const isAddToCartWithSameProduct =
					currentEventContent.action_type === 'add_to_cart' &&
					productPage &&
					currentEventContent.product_ids === lastEventContent?.product_ids &&
					currentEventContent.product_variant_ids === lastEventContent?.product_variant_ids;
				const shouldSkipEvent = isSameSnapshot && (currentEventContent.action_type !== 'add_to_cart' || isAddToCartWithSameProduct);

				if (shouldSkipEvent) {
					lastEventType = currentEventContent.action_type;
					lastEventContent = currentEventContent;
					return;
				}

				lastEventType = currentEventContent.action_type;
				lastEventContent = currentEventContent;

				oldInit();
			}
			return true;
		}
		return false;
	}

	const sendSubscribePayload = (payload) => {
		if (!payload || !payload.email) {
			return;
		}

		_edrone.email = payload.email;
		_edrone.action_type = payload.action_type;
		_edrone.customer_tags = payload.customer_tags;

		if (payload.first_name) {
			_edrone.first_name = payload.first_name;
		}

		if (payload.last_name) {
			_edrone.last_name = payload.last_name;
		}

		if (payload.phone) {
			_edrone.phone = payload.phone;
		}

		if (payload.subscriber_status) {
			_edrone.subscriber_status = payload.subscriber_status;
		}

		if (payload.sms_subscriber_status) {
			_edrone.sms_subscriber_status = payload.sms_subscriber_status;
		} else {
			delete _edrone.sms_subscriber_status;
		}

		_edrone.init();
	};

	const initializeSubscribeCapture = (retryCount = 0) => {
		if (subscribeCaptureInitRequested || legacySubscribeFallbackInitialized) {
			return;
		}

		if (!window._edrone_subscribe_capture) {
			// Wait for the CDN adapter before falling back to legacy capture.
			if (retryCount < SUBSCRIBE_CAPTURE_MAX_RETRIES) {
				setTimeout(() => initializeSubscribeCapture(retryCount + 1), SUBSCRIBE_CAPTURE_RETRY_DELAY_MS);
			} else {
				setupLegacySubscribeFallback();
			}
			return;
		}

		try {
			window._edrone_subscribe_capture.init({
				onUnavailable: setupLegacySubscribeFallback,
				send: sendSubscribePayload
			});
			subscribeCaptureInitRequested = true;
		} catch (error) {
			setupLegacySubscribeFallback();
		}
	};

	initializeSubscribeCapture();

	if (!updateInit() && !_edrone.init) {
		const checkForInitInterval = setInterval(() => {
			if (updateInit()) {
				clearInterval(checkForInitInterval);
			}
		}, 10);
	}

	// Universal Add to Cart Handler (Listing, Carousel, Quick Add)
	(function () {
		const addToCartSelectors = [
			'.add_to_cart_button',
			'.added_to_cart',
			'.ajax_add_to_cart',
			'.product-card__add-to-cart-button',
			'.single_add_to_cart_button',
			'[data-add-to-cart]',
			'.wp-block-button__link[data-product_id]',
			'.button.product_type_simple',
			'.button.product_type_variable',
		];

		const productCardSelectors = [
			'.product-card',
			'.product',
			'li[class*="product"]',
			'.wc-block-grid__product',
			'.type-product',
		];

		const activeVariantSelectors = [
			'.product-card__jar-size-attr--active[data-variation-id]',
			'[data-variation-id].active',
			'.variation-selector.selected[data-variation-id]',
		];

		document.body.addEventListener('click', function (event) {
			const button = addToCartSelectors
				.map(selector => event.target.closest(selector))
				.find(el => el !== null);

			if (!button) return;

			// Skip if product page handler should take precedence (has richer product data)
			if (window.productViewItem && button.matches('.single_add_to_cart_button')) {
				return;
			}

			let productId = '';
			let productVariantId = '';

			// Source 1: Button data attributes
			productId = button.dataset.product_id || button.dataset.productId || '';
			productVariantId = button.dataset.product_sku || button.dataset.productSku || 
				button.dataset.variation_id || button.dataset.variationId || '';

			// Source 2: Find parent product card and extract data
			if (!productId) {
				const productCard = productCardSelectors
					.map(selector => button.closest(selector))
					.find(el => el !== null);

				if (productCard) {
					// Try active variant button
					const activeVariantButton = activeVariantSelectors
						.map(selector => productCard.querySelector(selector))
						.find(el => el !== null);

					if (activeVariantButton) {
						productId = activeVariantButton.dataset.productId || activeVariantButton.dataset.product_id || '';
						productVariantId = activeVariantButton.dataset.variationId || activeVariantButton.dataset.variation_id || '';
					}

					// Try any button with variation data in product card
					if (!productId) {
						const variationButton = productCard.querySelector('[data-product-id][data-variation-id]') ||
							productCard.querySelector('[data-product_id][data-variation_id]');
						if (variationButton) {
							productId = variationButton.dataset.productId || variationButton.dataset.product_id || '';
							productVariantId = variationButton.dataset.variationId || variationButton.dataset.variation_id || '';
						}
					}

					// Try GTM4WP data
					if (!productId) {
						const gtmDataElement = productCard.querySelector('[data-gtm4wp_product_data]');
						if (gtmDataElement) {
							try {
								const gtmData = JSON.parse(gtmDataElement.dataset.gtm4wp_product_data);
								productId = gtmData.item_id || gtmData.id || gtmData.internal_id || '';
								productVariantId = productVariantId || gtmData.sku || '';
							} catch (e) {
								console.error('[edrone] Failed to parse GTM data', e);
							}
						}
					}

					// Try product card data attributes
					if (!productId) {
						productId = productCard.dataset.productId || productCard.dataset.product_id || 
							productCard.id?.replace(/[^\d]/g, '') || '';
					}
				}
			}

			// Source 3: Hidden variation_id input (for variable products)
			const variationInput = document.querySelector('input[name="variation_id"]') ||
				document.querySelector('input.variation_id') ||
				document.querySelector('[name="variation_id"]');
			if (variationInput && variationInput.value && variationInput.value !== '0') {
				productVariantId = variationInput.value;
			}

			// Source 4: Form with product data
			if (!productId) {
				const form = button.closest('form.cart, form.variations_form, form[data-product_id]');
				if (form) {
					productId = form.dataset.product_id || form.dataset.productId || '';
					const formVariationInput = form.querySelector('input[name="variation_id"]');
					if (formVariationInput && formVariationInput.value && formVariationInput.value !== '0') {
						productVariantId = formVariationInput.value;
					}
				}
			}

			// Source 5: Event target data attributes
			if (!productId) {
				productId = event.target.dataset.product_id || event.target.dataset.productId || '';
				productVariantId = productVariantId || event.target.dataset.product_sku || 
					event.target.dataset.productSku || '';
			}

			if (!productId) return;

			const product = {
				product_ids: productId,
				product_variant_ids: productVariantId,
			}

			Object.assign(_edrone, product, {
				action_type: 'add_to_cart'
			});
			_edrone.init();
		}, true)
	})();

	if (window.edroneMetadata) {
		Object.assign(_edrone, window.edroneMetadata);
	}

	if (window.homepageView) {
		Object.assign(_edrone, window.homepageView);
	}

	const checkForStoredProduct = () => {
		const storedAddToCart = localStorage.getItem('addToCartEvent');
		if (storedAddToCart) {
			const parsedAddToCart = JSON.parse(storedAddToCart);
			if (window.productViewItem || productPage) {
				if (!lastEventType) {
					const sendAddToCartInterval = setInterval(() => {
						if (lastEventType) {
							addToCartAction(parsedAddToCart);
							addToCartSent = true;
							clearInterval(sendAddToCartInterval)
						}
					}, 150);
				}
			} else {
				addToCartAction(parsedAddToCart);
				addToCartSent = true;
			}
		}
	}

	checkForStoredProduct();

	// Checks for stored product
	setTimeout(checkForStoredProduct, 2000);

	if (window.productViewItem) {
		Object.assign(_edrone, window.productViewItem);
		if (typeof _edrone.init === 'function') {
			_edrone.init();
		}
		// Add to cart from Product Page (uses productViewItem for full product data)
		const productPageButton = document.querySelector('.single_add_to_cart_button');
		if (productPageButton) {
			productPageButton.addEventListener('click', () => {
				const productData = { ...window.productViewItem };

				const variationInput = document.querySelector('input[name="variation_id"]') ||
					document.querySelector('input.variation_id');
				if (variationInput && variationInput.value && variationInput.value !== '0') {
					productData.product_variant_ids = variationInput.value;
				} else {
					const productSku = productPageButton?.dataset?.product_sku || 
						productPageButton?.dataset?.productSku || '';
					if (productSku) {
						productData.product_variant_ids = productSku;
					}
				}

				productData.action_type = 'add_to_cart';
				localStorage.setItem('addToCartEvent', JSON.stringify(productData));
				addToCartAction(productData);
			})
		}
	}

	// Product_view fallback
	if (!window.productViewItem && productPage) {
		try {
			let purchaseItem = null;

			try {
				// Find the entry where event is 'purchase'
				const datalayerPurchaseItemEvent = dataLayer.find(entry => entry.event === 'purchase');
				if (datalayerPurchaseItemEvent) {
					purchaseItem = datalayerPurchaseItemEvent[0].ecommerce;
				} else {
					// Find the entry where the first two elements are ['event', 'purchase']
					const datalayerPurchaseItemEntry = dataLayer.find(entry => entry[0] === 'event' && entry[1] === 'purchase');
					if (datalayerPurchaseItemEntry) {
						purchaseItem = datalayerPurchaseItemEntry[0][2];
					}
				}
			} catch (error) {
				console.error("[≡edrone] Error accessing dataLayer:", error);
			}

			// Fallback to HTML elements
			if (purchaseItem) {
				const order = {
					product_variant_ids: [],
					product_ids: [],
					product_titles: [],
					product_images: [],
					product_category_ids: [],
					product_category_names: [],
					product_urls: [],
					product_counts: [],
				};

				purchaseItem.items.forEach(item => {
						order.product_variant_ids.push(item.sku || '');
						order.product_ids.push(item.id || item.item_id);
						order.product_titles.push(item.name || item.item_name);
						order.product_urls.push(productPage.querySelector('td.product-name a').href);
						order.product_images.push('');
						order.product_category_names.push(item.item_category || '');
						order.product_counts.push(item.quantity || '');
				});
				for (const key in order) {
					if (Array.isArray(order[key])) {
						order[key] = order[key].join('|');
					}
				}
				Object.assign(_edrone, order, {
					action_type: 'order',
					base_currency: purchaseItem.currency,
					order_currency: purchaseItem.currency,
					email: productPage.querySelector('[class="woocommerce-customer-details--email"]')?.innerText.trim(),
					order_id: purchaseItem.transaction_id,
					base_payment_value: purchaseItem.value.toFixed(2),
					order_payment_value: purchaseItem.value.toFixed(2)
				});

				_edrone.init();
			}

		} catch (error) {
			console.error("[≡edrone] Error in main product flow:", error);
		}
	}

	if (window.categoryViewItem) {
		Object.assign(_edrone, window.categoryViewItem);
		return;
	}

	if (window.orderEvent) {
		Object.assign(_edrone, window.orderEvent);
		localStorage.removeItem('addToCartEvent');
	}

	// Order fallback
	if (!window.orderEvent && orderPage) {
		setTimeout(function () {

			const storedProducts = JSON.parse(localStorage.getItem('addToCartEvent')) || [];
			if (storedProducts.length) {
				const orderFields = [
					'product_variant_ids',
					'product_ids',
					'product_titles',
					'product_images',
					'product_category_ids',
					'product_category_names',
					'product_urls',
					'product_counts',
				];

				const order = Object.fromEntries(orderFields.map(field => [field, []]));

				const purchasedProducts = [...document.querySelectorAll('.woocommerce-table__line-item .product-name')];

				purchasedProducts.forEach(function (product) {
					const purchasedProductsName = item.textContent.trim();

					const matchedProduct = storedProducts.find(function (product) {
						return product.product_titles?.toLowerCase() === purchasedProductsName?.toLowerCase();
					});

					if (matchedProduct) {
						Object.entries(order).forEach(([key, value]) => {
							if (matchedProduct[key]) {
								value.push(matchedProduct[key]);
							}
						});
						const quantityElement = item.closest('tr').querySelector('.product-quantity');
						const quantity = quantityElement ? parseInt(quantityElement.innerText.replace(/[^0-9.]/g, '')) : '';
						order.product_counts.push(quantity);
					}
				});

				Object.entries(order).forEach(([key, value]) => {
					order[key] = value.join('|');
				});

				const orderDetails = document.querySelector('.woocommerce-thankyou-order-details');
				const amount = orderDetails.querySelector('.amount').innerText.replace(/[^0-9.]/g, '');

				window._edrone = window._edrone || {};
				Object.assign(_edrone, order, {
					action_type: 'order',
					email: orderDetails.querySelector('.email strong')?.innerText,
					order_id: orderDetails.querySelector('.order strong')?.innerText,
					base_currency: orderDetails.querySelector('.woocommerce-Price-currencySymbol')?.innerText,
					order_currency: orderDetails.querySelector('.woocommerce-Price-currencySymbol')?.innerText,
					base_payment_value: parseFloat((amount) / 100).toFixed(2),
					order_payment_value: parseFloat((amount) / 100).toFixed(2)
				})
				_edrone.init();
				localStorage.removeItem('addToCartEvent');
			} else {
				console.warn('[≡edrone] No stored products found in localStorage.')
			}
		}, 100);
	}

	function addToCartAction(item) {
		if (!orderPage) {
			Object.assign(_edrone, item);
			_edrone.init();
			localStorage.removeItem('addToCartEvent');
		}
	}
}, 500);
