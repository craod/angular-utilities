(function () {
	'use strict';

	angular
		.module('angular-utilities', []);
})();
(function () {
	'use strict';

	/**
	 * @ngdoc factory
	 * @name CrudServiceFactory
	 * @description
	 * Factory for creating CrudServices
	 */
	function CrudService($q, $http) {

		/**
		 * @ngdoc method
		 * @name CrudService#injectSortingFromProperties
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Inject the variables required for sorting into the request array from the properties array passed by the user to the endpoint
		 *
		 * @param {Object} request
		 * @param {Object} properties
		 * @returns {void}
		 */
		function injectSortingFromProperties(request, properties) {
			if (properties.sortBy) {
				request.sortBy = properties.sortBy;
				if (properties.order) {
					request.order = properties.order;
				}
			}
		}

		/**
		 * @ngdoc method
		 * @name CrudService#injectPaginationFromProperties
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Inject the variables required for pagination into the request array from the properties array passed by the user to the endpoint
		 *
		 * @param {Object} request
		 * @param {Object} properties
		 * @returns {void}
		 */
		function injectPaginationFromProperties(request, properties) {
			if (properties.offset) {
				request.offset = properties.offset;
			}
			if (properties.limit) {
				request.limit = properties.limit;
			}
		}

		/**
		 * @ngdoc method
		 * @name CrudService#injectFiltersFromProperties
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Inject the variables required for adding filters into the request array from the properties array passed by the user to the endpoint
		 *
		 * @param {Object} request
		 * @param {Object} properties
		 * @returns {void}
		 */
		function injectFiltersFromProperties(request, properties) {
			var filterName, filterKey;
			if (properties.filters) {
				for (filterName in properties.filters) {
					filterKey = 'filters[' + filterName + ']';
					request[filterKey] = properties.filters[filterName];
				}
			}
		}

		/**
		 * @ngdoc method
		 * @name CrudService#parseUrlWithParameters
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Given an associative array with parameters passed by the user, parse the url for required variables and add them if they exist in the parameters
		 *
		 * @param {string} url
		 * @param {Object} parameters
		 * @returns {string}
		 */
		function parseUrlWithParameters(url, parameters) {
			var name;
			for (name in parameters) {
				url = url.replace(new RegExp('\:' + name, 'g'), parameters[name]);
			}
			return url;
		}

		/**
		 * @ngdoc method
		 * @name CrudService#createCacheKey
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Create a unique cache key for the given endpoint name, using any number of name-value pairs passed as additional parameters to this function
		 *
		 * @param {string} name
		 * @param {...}
		 * @returns {string}
		 */
		function createCacheKey(name) {
			var index, argumentNumber, cacheKey = name;
			if (arguments.length > 1) {
				for (argumentNumber = 1; argumentNumber < arguments.length; argumentNumber++) {
					for (index in arguments[argumentNumber]) {
						cacheKey += '_' + index + ':' + arguments[argumentNumber][index];
					}
				}
			}
			return cacheKey;
		}

		/**
		 * @ngdoc method
		 * @name CrudService#addEndpoint
		 * @methodOf CrudService
		 * @access private
		 * @description
		 * Add an endpoint function to the given service with the given name, url and using the configuration provided. The following are the configuration keys that
		 * are understood:
		 *
		 * - method: The method to use to communicate with the server (get)
		 * - pagination: Whether the endpoint allows for automatic pagination (undefined, falsy)
		 * - sorting: Whether the endpoint allows for automatic sorting (undefined, falsy)
		 * - filtering: Whether the endpoint allows for automatic filtering (undefined, falsy)
		 * - cachable: Whether the endpoint may re-use the promise in order to provide a cache to prevent additional server calls (undefined, falsy)
		 *
		 * The result of this function is that the service will have a public method added with the requested name, of signature
		 * properties (object) - Endpoint-specific configuration
		 * parameters (object) - Request data
		 * data (object) - POST data
		 *
		 * @param {AbstractCrudService} service
		 * @param {string} name
		 * @param {string} url
		 * @param {Object} configuration
		 * @returns {void}
		 */
		function addEndpoint(service, name, url, configuration) {
			service[name] = function(properties, parameters, data) {
				properties = properties || {};
				parameters = parameters || {};
				data = data || {};
				var cacheKey, method, request = {}, force = properties.force, translatedUrl;

				method = (configuration.method) ? configuration.method : 'get';
				if (configuration.pagination) {
					injectPaginationFromProperties(request, properties);
				}
				if (configuration.sorting) {
					injectSortingFromProperties(request, properties);
				}
				if (configuration.filtering && properties.filters) {
					injectFiltersFromProperties(request, properties);
				}

				cacheKey = createCacheKey(name, request, data, parameters);
				translatedUrl = parseUrlWithParameters(url, parameters);
				if (!configuration.cachable || !service.cachedPromises[cacheKey] || force) {
					var originalPromise = $http({method: method, url: translatedUrl, params: request, data: data});
					var deferred = $q.defer();
					originalPromise.then(function (response) {
						var responseObject = {};
						if (configuration.pagination) {
							responseObject = {
								items: response.data.items,
								pagination: {
									offset: response.data.offset,
									limit: response.data.limit,
									total: response.data.total
								}
							};
						} else {
							responseObject = response.data;
						}
						deferred.resolve(responseObject);
					}, deferred.reject);
					service.cachedPromises[cacheKey] = deferred.promise;
				}
				return service.cachedPromises[cacheKey];
			};
		}

		/**
		 * @ngdoc service
		 * @name Craod.Admin:AbstractCrudService
		 * @param {Object} endpoints
		 * @description
		 * CRUD service that contains the given endpoints. Look at the addEndpoint function to understand the parameters expected for each endpoint. The
		 * endpoints array expects an associative array of keys and values with the keys being the endpoint names and the values being the individual endpoint
		 * configurations
		 */
		function AbstractCrudService(endpoints) {
			var self = this, name, endpoint;

			/**
			 * @ngdoc property
			 * @name AbstractCrudService#cachedPromises
			 * @propertyOf AbstractCrudService
			 * @description
			 * Clear all promise caches
			 *
			 * @type {Object}
			 */
			self.cachedPromises = {};

			/**
			 *
			 * @ngdoc method
			 * @name AbstractCrudService#clearCache
			 * @methodOf AbstractCrudService
			 * @description
			 * Clear the cache for the specific endpoint
			 *
			 * @param {string} endpoint
			 * @returns {void}
			 */
			self.clearCache = function (endpoint) {
				var key;
				for (key in self.cachedPromises) {
					if (key.indexOf(endpoint) === 0) {
						delete self.cachedPromises[key];
					}
				}
			};

			/**
			 *
			 * @ngdoc method
			 * @name AbstractCrudService#clearCaches
			 * @methodOf AbstractCrudService
			 * @description
			 * Clear all promise caches
			 *
			 * @returns {void}
			 */
			self.clearCaches = function () {
				self.cachedPromises = {};
			};

			for (name in endpoints) {
				endpoint = endpoints[name];
				addEndpoint(self, name, endpoint.url, endpoint);
			}
		}

		return AbstractCrudService;
	}

	CrudService.$inject = [
		'$q',
		'$http'
	];

	angular
		.module('angular-utilities')
		.factory('CrudService', CrudService);
})();
(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name CategoryService
	 * @description
	 * Service that provides CRUD functions for handling Craod categories
	 */
	function CategoryService (Settings, CrudService) {
		var self = this;

		var endpoints = {

			/**
			 * @ngdoc method
			 * @name CategoryService#count
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains the category count
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			count: {
				url: Settings.get('api.url') + 'category/count',
				cachable: true,
				filtering: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#getAll
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains all the categories matching the sorting, filtering and pagination settings
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getAll: {
				url: Settings.get('api.url') + 'category',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#getParents
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains all the categories matching the sorting, filtering and pagination settings that are parents of the requested
			 * category
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getParents: {
				url: Settings.get('api.url') + 'category/parents/:guid',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#getChildren
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains all the categories matching the sorting, filtering and pagination settings that are children of the requested
			 * category
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getChildren: {
				url: Settings.get('api.url') + 'category/children/:guid',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#getParents
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains all the categories matching the sorting, filtering and pagination settings that are parents of the requested
			 * object
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getCategoriesInObject: {
				url: Settings.get('api.url') + 'category/object/:guid',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#get
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains the category requested by its guid
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			get: {
				url: Settings.get('api.url') + 'category/:guid',
				cachable: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#create
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains the category as created using the properties in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			create: {
				url: Settings.get('api.url') + 'category',
				method: 'post'
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#update
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains the category as updated using the properties in the data parameter and the guid in the parameters
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			update: {
				url: Settings.get('api.url') + 'category/:guid',
				method: 'put'
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#delete
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the category identified by the guid was deleted
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			delete: {
				url: Settings.get('api.url') + 'category/:guid',
				method: 'delete'
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#activate
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the category identified by the guid was activated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			activate: {
				url: Settings.get('api.url') + 'category/activate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#deactivate
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the category identified by the guid was deactivated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			deactivate: {
				url: Settings.get('api.url') + 'category/deactivate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#search
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains a an array with categories which match the searchTerms string provided in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			search: {
				url: Settings.get('api.url') + 'category/search',
				method: 'post',
				cachable: true,
				pagination: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#search
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains a an array with categories which match the query string provided in the query parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			autocomplete: {
				url: Settings.get('api.url') + 'category/autocomplete/:query',
				method: 'get',
				cachable: true,
				pagination: true,
				sorting: false
			}
		};

		angular.extend(self, new CrudService(endpoints));
	}

	CategoryService.$inject = [
		'Settings',
		'CrudService'
	];

	angular
		.module('angular-utilities')
		.service('CategoryService', CategoryService);
})();
(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name Craod.Admin:ObjectService
	 * @description
	 * Service that provides CRUD functions for handling Craod objects
	 */
	function ObjectService (Settings, CrudService) {
		var self = this;

		var endpoints = {

			/**
			 * @ngdoc method
			 * @name ObjectService#count
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains the object count
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			count: {
				url: Settings.get('api.url') + 'object/count',
				cachable: true,
				filtering: true
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#getAll
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains all the objects matching the sorting, filtering and pagination settings
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getAll: {
				url: Settings.get('api.url') + 'object',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name CategoryService#getParents
			 * @methodOf CategoryService
			 * @description
			 * Returns a promise whose response contains all the objects matching the sorting, filtering and pagination settings that are children of the requested
			 * category
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getObjectsInCategory: {
				url: Settings.get('api.url') + 'object/category/:guid',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#get
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains the object requested by its guid
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			get: {
				url: Settings.get('api.url') + 'object/:guid',
				cachable: true
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#create
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains the object as created using the properties in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			create: {
				url: Settings.get('api.url') + 'object',
				method: 'post'
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#update
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains the object as updated using the properties in the data parameter and the guid in the parameters
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			update: {
				url: Settings.get('api.url') + 'object/:guid',
				method: 'put'
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#delete
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the object identified by the guid was deleted
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			delete: {
				url: Settings.get('api.url') + 'object/:guid',
				method: 'delete'
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#activate
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the object identified by the guid was activated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			activate: {
				url: Settings.get('api.url') + 'object/activate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#deactivate
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the object identified by the guid was deactivated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			deactivate: {
				url: Settings.get('api.url') + 'object/deactivate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name ObjectService#search
			 * @methodOf ObjectService
			 * @description
			 * Returns a promise whose response contains a an array with objects which match the searchTerms string provided in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			search: {
				url: Settings.get('api.url') + 'object/search',
				method: 'post',
				cachable: true,
				pagination: true,
				sorting: true
			}
		};

		angular.extend(self, new CrudService(endpoints));
	}

	ObjectService.$inject = [
		'Settings',
		'CrudService'
	];

	angular
		.module('angular-utilities')
		.service('ObjectService', ObjectService);
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
	 * @name Craod.Admin:UserService
	 * @description
	 * Service that provides CRUD functions for handling Craod users
	 */
	function UserService (Settings, CrudService) {
		var self = this;

		var endpoints = {

			/**
			 * @ngdoc method
			 * @name UserService#count
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the user count
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			count: {
				url: Settings.get('api.url') + 'user/count',
				cachable: true,
				filtering: true
			},

			/**
			 * @ngdoc method
			 * @name UserService#getAll
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains all the users matching the sorting, filtering and pagination settings
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			getAll: {
				url: Settings.get('api.url') + 'user',
				cachable: true,
				pagination: true,
				filtering: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name UserService#get
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the user requested by its guid
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			get: {
				url: Settings.get('api.url') + 'user/:guid',
				cachable: true
			},

			/**
			 * @ngdoc method
			 * @name UserService#create
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the user as created using the properties in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			create: {
				url: Settings.get('api.url') + 'user',
				method: 'post'
			},

			/**
			 * @ngdoc method
			 * @name UserService#update
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the user as updated using the properties in the data parameter and the guid in the parameters
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			update: {
				url: Settings.get('api.url') + 'user/:guid',
				method: 'put'
			},

			/**
			 * @ngdoc method
			 * @name UserService#delete
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the user identified by the guid was deleted
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			delete: {
				url: Settings.get('api.url') + 'user/:guid',
				method: 'delete'
			},

			/**
			 * @ngdoc method
			 * @name UserService#checkEmailAvailability
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the email requested is available for using
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			checkEmailAvailability: {
				url: Settings.get('api.url') + 'user/available/:email',
				cachable: true
			},

			/**
			 * @ngdoc method
			 * @name UserService#changePassword
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the result of trying to change the user's password
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			changePassword: {
				url: Settings.get('api.url') + 'user/password/change/:guid',
				method: 'post'
			},

			/**
			 * @ngdoc method
			 * @name UserService#resetPassword
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains the result of trying to reset the user's password to an automatically generated one
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			resetPassword: {
				url: Settings.get('api.url') + 'user/password/reset/:guid'
			},

			/**
			 * @ngdoc method
			 * @name UserService#activate
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the user identified by the guid was activated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			activate: {
				url: Settings.get('api.url') + 'user/activate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name UserService#deactivate
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the user identified by the guid was deactivated
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			deactivate: {
				url: Settings.get('api.url') + 'user/deactivate/:guid'
			},

			/**
			 * @ngdoc method
			 * @name UserService#logOut
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is true if the user identified by the guid was logged out
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			logOut: {
				url: Settings.get('api.url') + 'user/logout/:guid'
			},

			/**
			 * @ngdoc method
			 * @name UserService#search
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains an array with users which match the searchTerms string provided in the data parameter
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			search: {
				url: Settings.get('api.url') + 'user/search',
				method: 'post',
				cachable: true,
				pagination: true,
				sorting: true
			},

			/**
			 * @ngdoc method
			 * @name UserService#uploadProfilePicture
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains an associative array with the new profile picture information
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			uploadProfilePicture: {
				url: Settings.get('api.url') + 'user/image/:guid',
				method: 'post'
			},

			/**
			 * @ngdoc method
			 * @name UserService#uploadProfilePicture
			 * @methodOf UserService
			 * @description
			 * Returns a promise whose response contains a boolean which is TRUE if the image was deleted
			 *
			 * @param {Object} properties
			 * @param {Object} parameters
			 * @param {Object} data
			 * @returns {Promise}
			 */
			deleteProfilePicture: {
				url: Settings.get('api.url') + 'user/image/:guid',
				method: 'delete'
			}
		};

		/**
		 * @ngdoc method
		 * @name UserService#hasRole
		 * @methodOf UserService
		 * @description
		 * Returns true if the roles provided contain the role requested (using binary comparison)
		 *
		 * @param {int} roles
		 * @param {int} role
		 * @returns {boolean}
		 */
		self.hasRole = function (roles, role) {
			return (roles & role) === role;
		};

		angular.extend(self, new CrudService(endpoints));
	}

	UserService.$inject = [
		'Settings',
		'CrudService'
	];

	angular
		.module('angular-utilities')
		.service('UserService', UserService);
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