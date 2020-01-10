var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript //
function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// jQuery.style(name, value, priority) //
(function($) {
	if ($.fn.style) {
		return;
	}

	// Escape regex chars with //
	var escape = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};

	$.fn.style = function(styleName, value, priority) {
		// DOM node
		var node = this.get(0);
		// Ensure we have a DOM node
		if (typeof node == 'undefined') {
			return this;
		}
		// CSSStyleDeclaration
		var style = this.get(0).style;
		// Getter/Setter
		if (typeof styleName != 'undefined') {
			if (typeof value != 'undefined') {
				// Set style property
				priority = typeof priority != 'undefined' ? priority : '';
				style.setProperty(styleName, value, priority);
				return this;
			} else {
				// Get style property
				return style.getPropertyValue(styleName);
			}
		} else {
			// Get CSSStyleDeclaration
			return style;
		}
	};
})(jQuery);

(function($) {
	if ($.fn.inject) {
		return;
	}
	$.fn.inject = function(a, b, c) {
		if (typeof this.get(0) == 'undefined') {
			console.error('Node Undefined!');
			return this;
		}
		if (a == "script") {
			var script = document.createElement('script');
			script.setAttribute("type", "text/javascript");
			script.setAttribute("src", b);
			this.get(0).appendChild(script);
			if (typeof c !== 'undefined' && c == true) this.get(0).removeChild(script);
			return this;
		} else if (a == "inline-script") {
			var script = document.createElement('script');
			script.appendChild(document.createTextNode('('+ b +')();'));
			this.get(0).appendChild(script);
			if (typeof c !== 'undefined' && c == true) this.get(0).removeChild(script);
			return this;
		} else if (a == "css") {
			var style = document.createElement('link');
			style.setAttribute("type", "text/css");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("href", b);
			this.get(0).appendChild(style);
		} else {
			console.error("Invalid Type");
			return this;
		}


	}
})(jQuery);

function copyText(text) {
	$('body').append('<textarea style="position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;background:transparent;display:none" id="copyText"></textarea>');
	$('#copyText').show();
	$('#copyText').text(text);
	$('#copyText').select();
	document.execCommand('copy');
	$('#copyText').hide();
	$('#copyText').text('');
	setTimeout(function(){$('#copyText').remove();},2000);
}

$(function() {
	$('head').append(`
		<style>
			.alertBox {
				font-size: 12px;
				background: #161616 !important;
				position: fixed;
				top: 5em !important;
				left: 0 !important;
				right: 0 !important;
				margin: auto;
			}
			.alertBox * {
				outline: none !important;
			}
			.alertBox .ui-widget-content {
				background: #161616 !important;
			}
			.alertBox .ui-dialog-titlebar-close {
				border-radius: 3px;
				background: transparent;
			}
			.alertBox .ui-dialog-titlebar {
				background: #161616;
				border-radius: 3px;
				margin: 5px;
			}
			.alertBox .ui-button {
				border-radius: 3px;
				background: transparent;
			}
			.alertBox .ui-dialog-titlebar-close {
				display: none;
			}
			.ui-widget-overlay {
				background: rgba(17,17,17, 0.70) !important;
			}
		</style>
	`);
});

function createDialog(text, title, confirmText, cancelText, confirm, cancel) {
	$('body').append('<div style="text-align:center" id="alertBox">'+text+'</div>')
	$('#alertBox').dialog({ // Creates a dialog box
		show: {effect: "fade", duration: 100}, hide: {effect: "fade", duration: 100}, resizable: false, draggable: false,
		modal: true, width: 750,
		// position: {my: 'center', at: 'top-50', of: window},
		dialogClass: 'alertBox', title: title,
		buttons: [
			{
				text: confirmText,
				icons: {primary: 'ui-icon-check'},
				click: function() {
					$(this).dialog('close');
					setTimeout(function() {
						$('#alertBox').remove();
					}, 500);
					confirm();
				}
			}, {
				text: cancelText,
				icons: {primary: 'ui-icon-closethick'},
				click: function() {
					$(this).dialog('close');
					setTimeout(function() {
						$('#alertBox').remove();
					}, 500);
					if (cancel) cancel();
				}
			}
		]
	});
}

/*!
 * JavaScript Cookie v2.1.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

// https://gist.github.com/alexey-bass/1115557
versionCompare = function(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;

    var a = left.split('.')
    ,   b = right.split('.')
    ,   i = 0, len = Math.max(a.length, b.length);

    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
        }
    }

    return 0;
};