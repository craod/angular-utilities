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
			service.prototype[name] = function(properties, parameters, data) {
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
		 * @name AbstractCrudService
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