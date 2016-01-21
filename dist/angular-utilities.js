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
(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name Resource
	 * @description
	 * Utility to manipulate resources such as images, texts, etc
	 */
	function Resource (Settings) {
		var service = {};

		/**
		 * @ngdoc method
		 * @name Resource#getExtensionByMimeType
		 * @methodOf Resource
		 * @description
		 * Get the extension for a file based on its MIME type
		 *
		 * @param {string} mimeType
		 * @returns {string}
		 */
		service.getExtensionByMimeType = function (mimeType) {
			var extension = mimeType.toLowerCase().split('/')[1];
			if (extension == 'jpeg') {
				extension = 'jpg';
			}
			return extension;
		};

		/**
		 * @ngdoc method
		 * @name Resource#getApproximateSize
		 * Given a desired width and height, and an array of sizes, find the size which has the smaller absolute difference to the desired width and height
		 *
		 * @param {number} desiredWidth
		 * @param {number} desiredHeight
		 * @param {Array} sizes
		 * @returns {Array}
		 */
		service.getApproximateSize = function (desiredWidth, desiredHeight, sizes) {
			var index, width, height, size, difference, leastDifference, bestSize;
			for (index in sizes) {
				if (sizes[index] == 'watermarked') {
					continue;
				}
				size = sizes[index].split('-')[0].split('x');
				width = size[0];
				height = size[1];
				difference = (Math.abs(desiredWidth - width) + Math.abs(desiredHeight - height));
				if (leastDifference === undefined || difference < leastDifference) {
					leastDifference = difference;
					bestSize = sizes[index];
				}
			}

			return bestSize;
		};

		/**
		 * @ngdoc method
		 * @name Resource#getPublicUrl
		 * @methodOf Resource
		 * @description
		 * Get the public url of a file according to the configuration
		 *
		 * @param {string} filePath
		 * @returns {string}
		 */
		service.getPublicUrl = function (filePath) {
			return Settings.get('storage.location') + '/' + filePath;
		};

		/**
		 * @ngdoc method
		 * @name Resource#getProfilePictureUrl
		 * @methodOf Resource
		 * @description
		 * Get the url for a profile picture for the user, optionally fitting the required size
		 *
		 * @param {{profilePicture: {original: string, sizes: Array}, guid: string}|null} user
		 * @param {number|null} width
		 * @param {number|null} height
		 * @returns {string}
		 */
		service.getProfilePictureUrl = function (user, width, height) {
			if (user && user.profilePicture) {
				if (user.profilePicture.sizes && width && height) {
					return service.getPublicUrl('user/' + user.guid + '-' + service.getApproximateSize(width, height, user.profilePicture.sizes) + '.png');
				} else {
					return user.profilePicture.original;
				}
			} else {
				return service.getPublicUrl('user/anonymous.png');
			}
		};

		/**
		 * @ngdoc method
		 * @name Resource#getImageUrl
		 * @methodOf Resource
		 * @description
		 * Get the url for a content object of type image, optionally fitting the required size
		 *
		 * @param {{fileInformation: {original: string, sizes: Array}, guid: string, mimeType: string}|null} entity
		 * @param {number|null} width
		 * @param {number|null} height
		 * @returns {string}
		 */
		service.getImageUrl = function (entity, width, height) {
			if (entity && entity.fileInformation) {
				var extension = service.getExtensionByMimeType(entity.mimeType);
				if (entity.fileInformation.sizes && width && height) {
					return service.getPublicUrl('image/' + entity.guid + '-' + service.getApproximateSize(width, height, entity.fileInformation.sizes) + '.' + extension);
				} else {
					return entity.fileInformation.original;
				}
			} else {
				throw new Error('Entity contains no image information: ' + entity.guid);
			}
		};

		return service;
	}

	Resource.$inject = [
		'Settings'
	];

	angular
		.module('angular-utilities')
		.service('Resource', Resource);
})();