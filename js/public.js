/* global pysOptions */

!function ($) {

    var Pinterest = function () {

        var initialized = false;

        function getUtils() {
            return window.pys.Utils;
        }

        function getOptions() {
            return window.pysOptions;
        }

        var notCachedEventsIds = new Array();
        var isAddToCartFromJs = getOptions().woo.hasOwnProperty("addToCartCatchMethod")
            && getOptions().woo.addToCartCatchMethod === "add_cart_js";
        if (!isAddToCartFromJs) {
            notCachedEventsIds.push('woo_add_to_cart_on_button_click')
        }

        function fireEvent(name, event) {

            if(typeof window.pys_event_data_filter === "function" && window.pys_disable_event_filter(name,'pinterest')) {
                return;
            }

            var data = event.params;
            var ids = event.pixelIds.filter(function (pixelId) {
                if (getUtils().hasOwnProperty('hideMatchingPixel')) {
                    return !getUtils().hideMatchingPixel(pixelId, 'pinterest');
                }else{
                    return true;
                }
            });
            if (ids.length) {
                var params = {};


                window.pys.Utils.copyProperties(data, params);
                window.pys.Utils.copyProperties(window.pys.Utils.getRequestParams(), params);

                if (getOptions().pinterest.serverApiEnabled) {

					if(isAddToCartFromJs && event.e_id === "woo_add_to_cart_on_button_click" ) {
						Pinterest.updateEventId(event.name);
                    	event.eventID = Pinterest.getEventId(event.name);
                	} else if(!notCachedEventsIds.includes(event.e_id)) {

                        var isApiDisabled = getOptions().gdpr.all_disabled_by_api ||
                            getOptions().gdpr.facebook_disabled_by_api ||
                            getOptions().gdpr.tiktok_disabled_by_api ||
                            getOptions().gdpr.cookiebot_integration_enabled ||
                            getOptions().gdpr.cookie_notice_integration_enabled ||
                            getOptions().gdpr.consent_magic_integration_enabled ||
                            getOptions().gdpr.cookie_law_info_integration_enabled;
                        // Update eventID

                        if (event.eventID.length == 0 && (getOptions().ajaxForServerEvent || event.type !== "static")) {
                            event.eventID = pys_generate_token(36);
                        }

                        // send event from server if they was bloc by gdpr or need send with delay
                        if (getOptions().ajaxForServerEvent || isApiDisabled || event.delay > 0 || event.type !== "static") {

                            var json = {
                                action: 'pys_pinterest_api_event',
                                pixel: Pinterest.tag(),
                                event: name,
                                ids: ids,
                                data: params,
                                url: window.location.href,
                                eventID: event.eventID,
                                ajax_event: getOptions().ajax_event
                            };

                            if (event.hasOwnProperty('woo_order')) {
                                json['woo_order'] = event.woo_order;
                            }

                            if (event.hasOwnProperty('edd_order')) {
                                json['edd_order'] = event.edd_order;
                            }
                            if (event.e_id === "automatic_event_internal_link"
                                || event.e_id === "automatic_event_outbound_link"
                                || name == 'PageView'
                            ) {
                                setTimeout(function () {
                                    jQuery.ajax({
                                        type: 'POST',
                                        url: getOptions().ajaxUrl,
                                        data: json,
                                        headers: {
                                            'Cache-Control': 'no-cache'
                                        },
                                        success: function () {
                                        },
                                    });
                                }, 500)
                            } else {
                                jQuery.ajax({
                                    type: 'POST',
                                    url: getOptions().ajaxUrl,
                                    data: json,
                                    headers: {
                                        'Cache-Control': 'no-cache'
                                    },
                                    success: function () {
                                    },
                                });
                            }
                        }
                    }
                }
                params.eventID = event.eventID;

                if (getOptions().debug) {
                    console.log('[Pinterest] ' + name, params);
                }

                pintrk('track', name, params);
            }
        }

        /**
         * Public API
         */
        return {
            tag: function() {
                return "pinterest";
            },
            isEnabled: function () {
                return getOptions().hasOwnProperty('pinterest');
            },
            getHidePixel: function(){
                if(this.isEnabled() && getOptions().pinterest.hasOwnProperty('hide_pixels'))
                {
                    return getOptions().pinterest.hide_pixels;
                }
                return [];
            },
            disable: function () {
                initialized = false;
            },
            initEventIdCookies: function (key) {
                var ids = {};
                ids[key] = pys_generate_token(36)
                Cookies.set('pys_pinterest_event_id', JSON.stringify(ids));
            },

            updateEventId:function(key) {
                var cooData = Cookies.get("pys_pinterest_event_id")
                if(cooData === undefined) {
                    this.initEventIdCookies(key);
                } else {
                    var data = JSON.parse(cooData);
                    data[key] = pys_generate_token(36);
                    Cookies.set('pys_pinterest_event_id', JSON.stringify(data) );
                }
            },

            getEventId:function (key) {
                var data = Cookies.get("pys_pinterest_event_id");
                if(data === undefined) {
                    this.initEventIdCookies(key);
                    data = Cookies.get("pys_pinterest_event_id");
                }
                return JSON.parse(data)[key];
            },
            /**
             * Load pixel's JS
             *
             * @link: https://developers.pinterest.com/docs/ad-tools/enhanced-match/
             */
            loadPixel: function () {

                if (initialized || !this.isEnabled() || !getUtils().consentGiven('pinterest')) {
                    return;
                }
                var tagId = getOptions().pinterest.pixelIds;
                tagId = tagId.filter(function (pixelId) {
                    if (getUtils().hasOwnProperty('hideMatchingPixel')) {
                        return !getUtils().hideMatchingPixel(pixelId, 'pinterest');
                    }else{
                        return true;
                    }

                });
                if(tagId.length > 0 ) {
                    !function (e) {
                        if (!window.pintrk) {
                            window.pintrk = function () {
                                window.pintrk.queue.push(Array.prototype.slice.call(arguments))
                            };
                            var n = window.pintrk;
                            n.queue = [], n.version = "3.0";
                            var t = document.createElement("script");
                            t.async = !0, t.src = e;
                            var r = document.getElementsByTagName("script")[0];
                            r.parentNode.insertBefore(t, r)
                        }
                    }("https://s.pinimg.com/ct/core.js");

                    // initialize pixel
                    tagId.forEach(function (pixelId) {
                        pintrk('load', pixelId, {em: getOptions().pinterest.advancedMatching.em, external_id: getOptions().pinterest.advancedMatching.external_id, np: 'pixelyoursite'});
                        pintrk('page');
                    });

                    initialized = true;

                    getUtils().fireStaticEvents('pinterest');
                }
            },

            fireEvent: function (name, data) {

                if (!initialized || !this.isEnabled()) {
                    return false;
                }

                data.delay = data.delay || 0;
                data.params = data.params || {};

                if (data.delay === 0) {

                    fireEvent(name, data);

                } else {

                    setTimeout(function (name, params) {
                        fireEvent(name, params);
                    }, data.delay * 1000, name, data);

                }


            },

            onAdSenseEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onClickEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWatchVideo: function (event) {
                this.fireEvent(event.name, event);
            },

            onCommentEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onFormEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onDownloadEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAddToCartOnButtonEvent: function (product_id) {
                if(!getOptions().dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('pinterest')) {

                        var event = getUtils().clone(getOptions().dynamicEvents.woo_add_to_cart_on_button_click[this.tag()]);
                        getUtils().copyProperties(window.pysWooProductData[product_id]['pinterest'].params, event.params);
                        this.fireEvent(event.name, event);

                    }
                }

            },

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {

                window.pys_woo_product_data = window.pys_woo_product_data || [];

                if(!getOptions().dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;


                if (product_type === getUtils().PRODUCT_VARIABLE && !getOptions().pinterest.wooVariableAsSimple) {
                    product_id = parseInt($form.find('input[name="variation_id"]').val());
                }

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('pinterest')) {

                        var event = getUtils().clone(getOptions().dynamicEvents.woo_add_to_cart_on_button_click[this.tag()])
                        getUtils().copyProperties(window.pysWooProductData[product_id]['pinterest'].params, event.params);

                        if(product_type === getUtils().PRODUCT_GROUPED ) {
                            var total = 0;
                            $form.find(".woocommerce-grouped-product-list .qty").each(function(index){
                                var childId = $(this).attr('name').replaceAll("quantity[","").replaceAll("]","");
                                var quantity = parseInt($(this).val());
                                if(isNaN(quantity)) {
                                    quantity = 0;
                                }
                                var price = window.pysWooProductData[product_id]['pinterest'].grouped[childId].price;
                                total += price * quantity;
                            });
                            if(total == 0) return;// skip if no items selected
                            if(getOptions().woo.addToCartOnButtonValueEnabled &&
                                getOptions().woo.addToCartOnButtonValueOption !== 'global') {
                                event.params.value = total;
                            }
                        } else {
                            // maybe customize value option
                            if (getOptions().woo.addToCartOnButtonValueEnabled &&
                                getOptions().woo.addToCartOnButtonValueOption !== 'global') {
                                event.params.value = event.params.value * qty;
                            }
                        }
                        event.params.product_quantity = qty;


                        if(product_type === getUtils().PRODUCT_BUNDLE) {
                            var data = $(".bundle_form .bundle_data").data("bundle_form_data");
                            var items_sum = getBundlePriceOnSingleProduct(data);
                            var price = (data.base_price+items_sum )* qty;
                            if (getOptions().woo.addToCartOnButtonValueEnabled && getOptions().woo.addToCartOnButtonValueOption !== 'global') {
                                event.params.value = price;
                            }
                        }

                        var event_name = is_external ? getOptions().woo.affiliateEventName : event.name;

                        this.fireEvent(event_name, event);
                    }
                }
            },

            onWooRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAffiliateEvent: function (product_id) {
                if(!getOptions().dynamicEvents.woo_affiliate.hasOwnProperty(this.tag()))
                    return;
                var event = getOptions().dynamicEvents.woo_affiliate[this.tag()];

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('pinterest')) {

                        event = getUtils().copyProperties(event, {})
                        getUtils().copyProperties(window.pysWooProductData[product_id][this.tag()].params, event.params)
                        this.fireEvent( getOptions().woo.affiliateEventName, event);

                    }
                }
            },

            onWooPayPalEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {
                if(!getOptions().dynamicEvents.edd_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = getOptions().dynamicEvents.edd_add_to_cart_on_button_click[this.tag()];

                if (window.pysEddProductData.hasOwnProperty(download_id)) {

                    var index;

                    if (price_index) {
                        index = download_id + '_' + price_index;
                    } else {
                        index = download_id;
                    }

                    if (window.pysEddProductData[download_id].hasOwnProperty(index)) {
                        if (window.pysEddProductData[download_id][index].hasOwnProperty('pinterest')) {

                            event = getUtils().copyProperties(event, {})
                            getUtils().copyProperties(window.pysEddProductData[download_id][index]['pinterest'].params, event.params);

                            // maybe customize value option
                            if (getOptions().edd.addToCartOnButtonValueEnabled && getOptions().edd.addToCartOnButtonValueOption !== 'global') {
                                event.params.value = event.params.value * qty;
                            }

                            event.params.product_quantity = qty;
                            this.fireEvent(event.name,event);
                        }
                    }
                }
            },

            onEddRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },
            onPageScroll: function (event) {
                this.fireEvent(event.name, event);
            },
            onTime: function (event) {
                this.fireEvent(event.name, event);
            },

        };

    }();

    window.pys = window.pys || {};
    window.pys.Pinterest = Pinterest;

}(jQuery);