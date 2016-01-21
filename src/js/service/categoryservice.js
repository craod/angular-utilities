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