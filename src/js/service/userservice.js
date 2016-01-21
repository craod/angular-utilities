(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name UserService
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