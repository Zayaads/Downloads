/**
 * EdroneSubscribeCapture - WooCommerce default rules and selectors.
 *
 * Goal: capture subscriptions out of the box so support does not have to ship
 * per-shop custom scripts. Defaults stay universal, lightweight and readable -
 * we will not catch everything, but we cover the popular plugins and conventions.
 * Anything store-specific belongs in window._edrone_subscribe_capture.addRule().
 *
 * Public API:
 *   window._edrone_subscribe_capture.init({ deduplicationMs, send, onUnavailable })
 *   window._edrone_subscribe_capture.addRule({ tag, match, trigger, matchButton, scope, fields, requireCheckbox, requireSmsCheckbox })
 *   window._edrone_subscribe_capture.getInstance()
 *
 * Rule shape follows the shared EdroneSubscribeCapture convention. Confirmed non-order
 * subscriptions carry subscriber_status: 1 to keep behaviour consistent across integrations.
 *
 * Supported newsletter / consent integrations:
 *   - WooCommerce core checkout (#billing_email + #place_order) when a newsletter / marketing consent checkbox is added by a supported plugin, theme or custom store code
 *   - WooCommerce core register (form.woocommerce-form-register, #reg_email) when a newsletter / marketing consent checkbox is added by a supported plugin, theme or custom store code
 *   - WooCommerce Blocks checkout (.wc-block-checkout, #billing-email with hyphen) when a newsletter / marketing consent checkbox is added by a supported plugin, theme or custom store code
 *   - WooCommerce My Account (#account_email, #save_acc_det) when a newsletter / marketing consent checkbox is added by a supported plugin, theme or custom store code
 *   - MailPoet (checkout + register opt-in)
 *   - Mailchimp for WooCommerce (checkout opt-in)
 *   - Mailchimp embedded form / MC4WP (#mc-embedded-subscribe, input[name="EMAIL"])
 *   - MailerLite (WP plugin + Universal Forms / .ml-block-form)
 *   - Klaviyo for WooCommerce (newsletter + SMS consent)
 *   - WooCommerce MailerLite Subscriber Sync (#woo_ml_subscribe)
 *   - GetResponse (#gr_marketing_consent)
 *   - Newsletter (TNP - The Newsletter Plugin)
 *   - Contact Form 7 (footer / landing forms with #acceptance-newsletter*)
 *   - xoo Login / Register
 *
 * Limited / fallback support (works only via generic patterns):
 *   - WPForms (per-form dynamic IDs - clients should add custom rule via addRule())
 *   - Elementor Forms (input[name="form_fields[email]"] - generic match)
 *
 * TODO: Add dedicated out-of-the-box Elementor and Contact Form 7 handlers,
 * ideally using their successful submit events instead of generic click/submit capture.
 *
 * Polish theme conventions (no specific plugin, common in PL stores):
 *   - zgoda1 (newsletter) / zgoda2 (SMS) consent inputs
 *   - #nl-email / #nl-firstname / #nl-phone IDs
 */
window._edrone_subscribe_capture = (function () {
	const DEFAULT_DEDUPLICATION_MS = 30000;
	const RETRY_DELAY_MS = 500;
	const MAX_RETRIES = 10;
	const knownNewsletterCheckboxes = [
		// Generic newsletter consent (any plugin / theme)
		'#newsletter',
		'#newsletter_opt_in',
		'#newsletter_optin',
		'#newsletter_consent',
		'#newsletter_agree',
		'#newsletter-account',
		'#newsletter_zapis',
		'#registerNewsletter',
		'#Newsletter',
		'input[name="newsletter"]',
		'input[name="newsletter_optin"]',
		'input[name="newsletter_consent"]',
		'input[name="profile_newsletter"]',
		'input[name="term_newsletter"]',
		// MailPoet
		'#mailpoet_woocommerce_checkout_optin',
		'#mailpoet_subscribe_on_register',
		// Mailchimp for WooCommerce
		'#mailchimp_woocommerce_newsletter',
		'input[name="mailchimp_woocommerce_newsletter"]',
		// Klaviyo for WooCommerce
		'#kl_newsletter_checkbox',
		// WooCommerce MailerLite Subscriber Sync
		'#woo_ml_subscribe',
		// GetResponse
		'#gr_marketing_consent',
		// Newsletter (TNP - The Newsletter Plugin)
		'input[name="ny"]',
		// Contact Form 7 - newsletter-specific acceptance fields
		'#accept-newsletter',
		'#accept-newsletter2',
		'#accept_save_newsletter',
		'#acceptance-newsletter',
		'#acceptance-newsletter2',
		// Polish theme conventions
		'input[name="zgoda1"]'
	].join(', ');
	const knownSmsCheckboxes = [
		// Generic
		'input[name="sms_consent"]',
		'input[name="sms"]',
		'input[name="sms_subscriber_status"]',
		// Klaviyo for WooCommerce
		'#kl_sms_consent_checkbox',
		// Polish theme conventions
		'input[name="zgoda2"]'
	].join(', ');
	const landingUrlPatterns = ['/newsletter', '/zapis', '/subskryb', '/landing'];
	const contactKeywords = ['contact', 'kontakt', 'wycena', 'quote', 'enquiry', 'inquiry', 'formularz-kontakt'];
	const popupSelectors = '[class*="popup"], [class*="modal"], [class*="dialog"], [role="dialog"], .pum-container, .fancybox-content';

	let pendingRules = [];
	let subscribeCapture = null;
	let initialized = false;
	let unavailableHandled = false;
	let pendingOptions = {
		deduplicationMs: DEFAULT_DEDUPLICATION_MS,
		send: null,
		onUnavailable: null
	};

	const normalizeText = (value) => {
		if (!value) {
			return '';
		}

		try {
			return value
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.trim();
		} catch (error) {
			return value.toLowerCase().trim();
		}
	};

	const hasKeyword = (value, keywords) => keywords.some((keyword) => normalizeText(value).includes(keyword));

	const isExcludedForm = (form) => form.matches(
		'.checkout, form.checkout, .woocommerce-form-register, .woocommerce-form-login, form.cart, form[name="add-to-cart"]'
	);

	const isPopupForm = (form) => Boolean(form.closest(popupSelectors));

	const formSignature = (form) => normalizeText([
		form.id,
		form.className,
		form.getAttribute('action') || '',
		form.getAttribute('aria-label') || '',
		form.getAttribute('name') || ''
	].join(' '));

	const isContactForm = (form) => hasKeyword(formSignature(form), contactKeywords);

	const isLandingForm = (form) => {
		const url = ((window.location && window.location.pathname) || '').toLowerCase();
		if (landingUrlPatterns.some((pattern) => url.includes(pattern))) {
			return true;
		}

		return hasKeyword(formSignature(form), ['landing', 'lp-', '-lp']);
	};

	const isFooterLikeForm = (form) => {
		if (isExcludedForm(form)) {
			return false;
		}

		const signature = normalizeText([
			form.id,
			form.className,
			form.getAttribute('action'),
			form.getAttribute('name'),
			form.closest('footer, [class*="footer"], [id*="footer"]')?.className || ''
		].join(' '));

		return hasKeyword(signature, ['newsletter', 'subscribe', 'mailchimp', 'mailpoet', 'mailerlite', 'klaviyo']);
	};

	const newsletterFormFields = {
		email: 'input[type="email"], input[name*="email"], input[name="EMAIL"], input[name="your-email"], input[name="E-mail"], input[name="userEmail"], input[name="fields[email]"], input[name="form_fields[email]"], #mce-EMAIL, #mailerlite-1-field-email, #nl-email',
		first_name: 'input[name*="first"], input[name*="fname"], input[name="first_name"], input[name="firstname"], input[name="given-name"], input[autocomplete="given-name"], input[name="FNAME"], input[name="your-name"], input[name="userName"], input[name="imie"], input[name="fields[name]"], #nl-firstname',
		last_name: 'input[name*="last"]',
		phone: 'input[name*="phone"], input[name="tel"], input[name="telefon"], #nl-phone'
	};

	const createDefaultRules = () => [
		{
			tag: 'Order',
			match: 'form.checkout, form[name="checkout"], .woocommerce-checkout form, .wc-block-checkout form',
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: {
				email: '#billing_email, input[name="billing_email"], #email, #billing-email, input[name="tempEmail"]',
				first_name: '#billing_first_name, input[name="billing_first_name"], #billing-first_name, #shipping-first_name, input[name="Nome"]',
				last_name: '#billing_last_name, input[name="billing_last_name"], #billing-last_name, #shipping-last_name',
				phone: '#billing_phone, input[name="billing_phone"], #billing-phone, input[name="Telefone"]'
			}
		},
		{
			tag: 'Order',
			trigger: 'click',
			matchButton: '#place_order, button[name="woocommerce_checkout_place_order"], .wc-block-components-checkout-place-order-button',
			scope: 'form.checkout, form[name="checkout"], .woocommerce-checkout form, .wc-block-checkout form',
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: {
				email: '#billing_email, input[name="billing_email"], #email, #billing-email, input[name="tempEmail"]',
				first_name: '#billing_first_name, input[name="billing_first_name"], #billing-first_name, #shipping-first_name, input[name="Nome"]',
				last_name: '#billing_last_name, input[name="billing_last_name"], #billing-last_name, #shipping-last_name',
				phone: '#billing_phone, input[name="billing_phone"], #billing-phone, input[name="Telefone"]'
			}
		},
		{
			tag: 'Register',
			match: (form) => form.matches(
				'form.register, .woocommerce-form-register, .woocommerce-form.woocommerce-form-register.register, form[action*="action=register"], #formCadastro, #customer_login form'
			) || Boolean(form.querySelector('input[name="xoo_el_reg_email"], #account_email, #reg_email')),
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: {
				email: '#reg_email, input[name="email"], input[name="xoo_el_reg_email"], #account_email, #Email',
				first_name: '#billing_first_name, #account_first_name, input[name="first_name"], input[name="xoo_el_reg_fname"], #NomeCompleto',
				last_name: '#billing_last_name, #account_last_name, input[name="last_name"], input[name="xoo_el_reg_lname"]',
				phone: '#billing_phone, input[name="billing_phone"], input[name="phone"], #TelefonePrincipal'
			}
		},
		{
			tag: 'Register',
			trigger: 'click',
			matchButton: '.woocommerce-form-register__submit, button[name="register"], .xoo-el-register-btn, #save_acc_det, [id="btn-submit-recaptcha-formCadastro"]',
			scope: 'form.register, .woocommerce-form-register, .woocommerce-form.woocommerce-form-register.register, #formCadastro, #customer_login form',
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: {
				email: '#reg_email, input[name="email"], input[name="xoo_el_reg_email"], #account_email, #Email',
				first_name: '#billing_first_name, #account_first_name, input[name="first_name"], input[name="xoo_el_reg_fname"], #NomeCompleto',
				last_name: '#billing_last_name, #account_last_name, input[name="last_name"], input[name="xoo_el_reg_lname"]',
				phone: '#billing_phone, input[name="billing_phone"], input[name="phone"], #TelefonePrincipal'
			}
		},
		{
			tag: 'Popup',
			match: (form) => !isExcludedForm(form) && isPopupForm(form),
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: newsletterFormFields
		},
		{
			tag: 'Landing',
			match: (form) => !isExcludedForm(form) && !isPopupForm(form) && isLandingForm(form),
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: newsletterFormFields
		},
		{
			tag: 'Contact',
			match: (form) => !isExcludedForm(form) && !isPopupForm(form) && !isLandingForm(form) && isContactForm(form),
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: newsletterFormFields
		},
		{
			tag: 'Footer',
			match: (form) => !isContactForm(form) && !isPopupForm(form) && !isLandingForm(form) && isFooterLikeForm(form),
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: newsletterFormFields
		},
		{
			tag: 'Footer',
			trigger: 'click',
			matchButton: '[type="submit"], input[type="submit"], button[type="submit"], .mailpoet_submit, .mailerlite-subscribe-submit, .wpcf7-submit, #mc-embedded-subscribe, .tnp-submit',
			scope: 'footer, [class*="newsletter"], [id*="newsletter"], [class*="mailerlite"], [class*="mailpoet"], [class*="mailchimp"]',
			requireCheckbox: knownNewsletterCheckboxes,
			requireSmsCheckbox: knownSmsCheckboxes,
			fields: newsletterFormFields
		}
	];

	const mergeOptions = (options) => {
		pendingOptions = {
			deduplicationMs: options?.deduplicationMs || pendingOptions.deduplicationMs,
			send: options?.send || pendingOptions.send,
			onUnavailable: options?.onUnavailable || pendingOptions.onUnavailable
		};
	};

	const handleUnavailable = () => {
		if (unavailableHandled) {
			return;
		}

		unavailableHandled = true;
		if (typeof pendingOptions.onUnavailable === 'function') {
			pendingOptions.onUnavailable();
		}
	};

	const buildConfig = () => ({
		rules: pendingRules.slice(),
		deduplicationMs: pendingOptions.deduplicationMs,
		onSubscribe: (data) => {
			if (typeof pendingOptions.send !== 'function') {
				return;
			}

			const payload = {
				action_type: data.action || 'subscribe',
				email: data.email,
				first_name: data.first_name,
				last_name: data.last_name,
				phone: data.phone,
				customer_tags: data.tag
			};

			if (data.tag !== 'Order') {
				payload.subscriber_status = 1;
				if (data.sms_subscriber_status) {
					payload.sms_subscriber_status = data.sms_subscriber_status;
				}
			}

			pendingOptions.send(payload);
		}
	});

	const initializeWithRetry = (retryCount) => {
		const SubscribeCapture = window.EdroneSubscribeCapture || null;
		if (!SubscribeCapture) {
			if (retryCount < MAX_RETRIES) {
				setTimeout(() => initializeWithRetry(retryCount + 1), RETRY_DELAY_MS);
			} else {
				handleUnavailable();
			}
			return;
		}

		if (subscribeCapture) {
			return;
		}

		try {
			subscribeCapture = new SubscribeCapture(buildConfig());
			subscribeCapture.init();
		} catch (error) {
			subscribeCapture = null;
			handleUnavailable();
		}
	};

	pendingRules = createDefaultRules();

	return {
		init: function (options) {
			mergeOptions(options);

			if (initialized) {
				return;
			}

			initialized = true;
			initializeWithRetry(0);
		},
		addRule: function (rule) {
			if (!rule) {
				return;
			}

			pendingRules.push(rule);
			if (subscribeCapture && typeof subscribeCapture.addRule === 'function') {
				subscribeCapture.addRule(rule);
			}
		},
		getInstance: function () {
			return subscribeCapture;
		}
	};
})();
