(function () {
	'use strict';

	angular
		.module('angular-utilities', []);
})();
(function () {
	'use strict';

	/**
	 * @ngdoc provider
	 * @name SettingsProvider
	 * @description
	 * Provider for configuration of the Settings service
	 */
	function SettingsProvider () {
		var provider = this;

		/**
		 * @ngdoc property
		 * @name SettingsProvider#data
		 * @propertyOf SettingsProvider
		 * @description
		 * The data to start with
		 *
		 * @type {Object}
		 */
		provider.data = {};

		/**
		 * @ngdoc property
		 * @name SettingsProvider#endpoint
		 * @propertyOf SettingsProvider
		 * @description
		 * The endpoint to load the settings from
		 *
		 * @type {string}
		 */
		provider.endpoint = '';

		/**
		 * @ngdoc service
		 * @name Settings
		 * @description
		 * Service that provides functions for loading and accessing server settings
		 */
		function Settings ($http) {
			var service = {};

			/**
			 * @ngdoc property
			 * @propertyOf Settings
			 * @description
			 * The actual settings data as received from the server
			 *
			 * @type {Object}
			 */
			service.data = angular.copy(provider.data);

			/**
			 * @ngdoc method
			 * @methodOf Settings
			 * @description
			 * Returns true if the settings have been loaded from the server
			 *
			 * @returns {boolean}
			 */
			service.isLoaded = function () {
				return !!service.initialized;
			};


			/**
			 * @ngdoc method
			 * @methodOf Settings
			 * @description
			 * Load the settings from the endpoint specified in the provider
			 *
			 * @returns {Promise}
			 */
			service.load = function () {
				var promise = $http.get(provider.endpoint);
				service.initialized = false;
				promise.then(function (response) {
					service.data = angular.extend(response.data, provider.data);
				});

				promise.finally(function () {
					service.initialized = true;
				});

				return promise;
			};

			/**
			 * @ngdoc method
			 * @methodOf Settings
			 * @description
			 * Checks whether the setting exists
			 *
			 * @param {string} setting
			 * @return boolean
			 */
			service.settingExists = function (setting) {
				var settingParts = setting.split('.'),
					data = angular.copy(service.data),
					index, part;
				for (index in settingParts) {
					part = settingParts[index];
					if (!data.hasOwnProperty(part)) {
						return false;
					} else {
						data = data[part];
					}
				}

				return true;
			};

			/**
			 * @ngdoc method
			 * @methodOf Settings
			 * @description
			 * Get the setting at the given path, if it does not exist return the default value
			 *
			 * @param {string} setting
			 * @param {*} defaultValue
			 * @return mixed
			 */
			service.get = function (setting, defaultValue) {
				var settingParts = setting.split('.'),
					data = angular.copy(service.data),
					index, part;
				for (index in settingParts) {
					part = settingParts[index];
					if (!data.hasOwnProperty(part)) {
						return defaultValue;
					} else {
						data = data[part];
					}
				}

				return data;
			};

			return service;
		}

		Settings.$inject = [
			'$http'
		];

		provider.$get = Settings;
	}

	angular
		.module('angular-utilities')
		.provider('Settings', SettingsProvider);
})();