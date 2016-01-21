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