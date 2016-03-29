(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name Api
	 * @description
	 * Service that contains the services which communicate with the server, which are automatically created from the endpoint schema received from the server
	 */
	function Api(Settings, $q, $http) {
		var loadingPromise,
			cachedPromises = {};
		var service = {

			/**
			 * @ngdoc property
			 * @name Api#services
			 * @propertyOf Api
			 * @description
			 * The individual services in an associative array
			 * @var {Object}
			 */
			services: {},

			/**
			 * @ngdoc method
			 * @name Api#load
			 * @methodOf Api
			 * @description
			 * Load the endpoint schema from the server and create the services
			 *
			 * @returns {promise}
			 */
			load: function () {
				if (!loadingPromise) {
					var deferred = $q.defer(),
						originalPromise = $http({method: 'get', url: Settings.get('api.url') + 'schema/endpoints'});
					originalPromise.then(function (response) {
						addSchemaEndpoints(response.data);
						deferred.resolve();
					}, deferred.reject);
					loadingPromise = deferred.promise;
				}
				return loadingPromise;
			}
		};

		/**
		 * @ngdoc method
		 * @name Api#injectSortingFromProperties
		 * @methodOf Api
		 * @access private
		 * @description
		 * Inject the variables required for sortable into the request array from the properties array passed by the user to the endpoint
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
		 * @name Api#injectPaginationFromProperties
		 * @methodOf Api
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
		 * @name Api#injectFiltersFromProperties
		 * @methodOf Api
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
		 * @name Api#parseUrlWithParameters
		 * @methodOf Api
		 * @access private
		 * @description
		 * Given an associative array with parameters passed by the user, parse the url for required variables and add them if they exist in the parameters. Remove them
		 * from the parameters thereafter so that the remaining parameters may be passed in the data parameter of the http request
		 *
		 * @param {string} url
		 * @param {Object} parameters
		 * @returns {string}
		 */
		function parseUrlWithParameters(url, parameters) {
			var name,
				pattern,
				apiUrl = document.createElement('a');
			for (name in parameters) {
				pattern = new RegExp('\:' + name, 'g');
				if (url.match(pattern)) {
					url = url.replace(pattern, parameters[name]);
					delete parameters[name];
				}
			}

			apiUrl.href = Settings.get('api.url');
			return apiUrl.origin + url;
		}

		/**
		 * @ngdoc method
		 * @name Api#createCacheKey
		 * @methodOf Api
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
		 * @name Api#addEndpoint
		 * @methodOf Api
		 * @access private
		 * @description
		 * Add an endpoint function to the given schema object with the given name using the configuration provided. The following are the configuration keys that
		 * are understood:
		 *
		 * - route: The route to use
		 * - method: The method to use to communicate with the server (get)
		 * - paginatable: Whether the endpoint allows for automatic paginating (undefined, falsy)
		 * - sortable: Whether the endpoint allows for automatic sorting (undefined, falsy)
		 * - filterable: Whether the endpoint allows for automatic filtering (undefined, falsy)
		 * - cachable: Whether the endpoint may re-use the promise in order to provide a cache to prevent additional server calls (undefined, falsy)
		 *
		 * The result of this function is that the service will have a public method added with the requested name, of signature
		 * parameters (object) - Request data
		 * properties (object) - Endpoint-specific configuration
		 * The method also contains a child method called clearCache()
		 *
		 * @param {string} schemaObject
		 * @param {string} name
		 * @param {Object} configuration
		 * @returns {void}
		 */
		function addEndpoint(schemaObject, name, configuration) {
			service.services[schemaObject][name] = function(parameters, properties) {
				properties = properties || {};
				parameters = parameters || {};

				var cacheKey,
					method,
					request = {},
					force = properties.force,
					translatedUrl;

				method = (configuration.method) ? configuration.method : 'get';
				if (configuration.paginatable) {
					injectPaginationFromProperties(request, properties);
				}
				if (configuration.sortable) {
					injectSortingFromProperties(request, properties);
				}
				if (configuration.filterable && properties.filters) {
					injectFiltersFromProperties(request, properties);
				}

				cacheKey = createCacheKey(name, request, parameters);
				translatedUrl = parseUrlWithParameters(configuration.route, parameters);
				if (!cachedPromises[schemaObject] || !cachedPromises[schemaObject][cacheKey] || !configuration.cachable || force) {
					var originalPromise = $http({method: method, url: translatedUrl, params: request, data: parameters});
					var deferred = $q.defer();
					originalPromise.then(function (response) {
						var responseObject = {};
						if (configuration.paginatable) {
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
					if (!cachedPromises[schemaObject]) {
						cachedPromises[schemaObject] = {};
					}
					cachedPromises[schemaObject][cacheKey] = deferred.promise;
				}
				return cachedPromises[schemaObject][cacheKey];
			};

			service.services[schemaObject][name].clearCache = function () {
				var key;
				if (cachedPromises.hasOwnProperty(schemaObject)) {
					for (key in cachedPromises[schemaObject]) {
						if (key.indexOf(name) === 0) {
							delete cachedPromises[schemaObject][key];
							return true;
						}
					}
				}
				return false;
			}
		}

		/**
		 * @ngdoc method
		 * @name Api#addSchemaEndpoints
		 * @methodOf Api
		 * @access private
		 * @description
		 * Add the endpoints received from the server to the service, to be parsed into services. Each individual service also receives a clearCaches function
		 * to clear the future caches for all functions
		 *
		 * @param {Object} schemaEndpoints
		 * @returns {void}
		 */
		function addSchemaEndpoints (schemaEndpoints) {
			var schemaObject, action, configuration;
			for (schemaObject in schemaEndpoints) {
				service.services[schemaObject] = {};
				for (action in schemaEndpoints[schemaObject]) {
					configuration = schemaEndpoints[schemaObject][action];
					addEndpoint(schemaObject, action, configuration);
				}
				service.services[schemaObject].clearCaches = function () {
					cachedPromises[schemaObject] = {};
				}
			}
		}

		return service;
	}

	Api.$inject = [
		'Settings',
		'$q',
		'$http'
	];

	angular
		.module('angular-utilities')
		.service('Api', Api);
})();