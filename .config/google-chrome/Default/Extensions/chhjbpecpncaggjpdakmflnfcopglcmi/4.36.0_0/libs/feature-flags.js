import Events from 'events';

export default class extends Events {
//export default class {

	// url;
	// appId;
	// apiKey;
	// attributes;
	// variations;

	/**
	 * Represents a FeatureFlag Class.
	 * @constructor
	 * @param {string} url - Feature Flag URL
	 * @param {string} appId - App ID
	 * @param {string} apiKey - Api Key
	 * @param {Integer} updateInterval - update interval in ms
	 * @param {Object} attributes - Default Attributes
	 */
	constructor({ url, appId, apiKey, updateInterval }, attributes) {
		super();
		this._url = url;
		this._appId = appId;
		this._apiKey = apiKey;
		this._updateInterval = updateInterval;
		this._variations = {};
		this._attributes = {};

		if (attributes) { 
			this.identify(attributes);
		}
	}

	/**
	 * Fetch Flags from Backend
	 */
	async fetch() {
		const url = new URL(this._url);
		Object.keys(this._attributes).forEach(key => url.searchParams.append(key, this._attributes[key]));
		const response = await fetch(url, {
			headers: {
				'APP-ID': this._appId,
				'API-KEY': this._apiKey
			},
		});
		if (response.status === 200) {
			const json = await response.json();
			this._variations = json;
		}
		return this;
	}

	/**
	 * 
	 * @param {Object} attributes - New Set of Attributes
	 */
	async identify(attributes = {}) {
		if (this._updateInterval) {
			clearTimeout(this._timeout);
			this._timeout = setInterval(() => this.fetch(), this._updateInterval);
		}
		this._attributes = attributes;
		await this.fetch();
		this.emit('ready', this);
	}

	/**
	 * The variation method determines which variation of a feature flag a user receives.
	 * @param {String} key 
	 * @param {Any} defaultValue 
	 */
	variation(key, defaultValue) {
		let keys = key.split('.');
		function getValue(obj, keys) {
			let key = keys.shift();
			if (obj.hasOwnProperty(key)) {
				return keys.length ? getValue(obj[key], keys) : obj[key];
			} else {
				return defaultValue;
			}
		}
		return getValue(this._variations, keys);
	}

	toJSON() {
		return JSON.parse(JSON.stringify(this._variations));
	}

	// TODO:
	// Subscribing to feature flag changes
	// The client uses an event emitter pattern to allow you to subscribe to feature flag changes in real time. To subscribe to all feature flag changes, listen for the change event:

	// ff.on('change:YOUR_FLAG_KEY', function(value, previous) {
	// 	console.log('YOUR_FLAG_KEY changed:', value, '(' + previous + ')');
	// });

}