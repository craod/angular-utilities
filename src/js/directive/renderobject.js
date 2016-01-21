(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name RenderObject
	 * @description
	 * Render an object using the given translation key or showing the given property - if the object is presented as a guid, load the object first and then
	 * render it
	 */
	function RenderObject ($injector) {
		return {
			restrict: 'A',
			scope: {
				object: '=',
				format: '@?',
				property: '@?',
				type: '@renderObject'
			},
			template: '<i data-ng-if="loading" class="fa fa-refresh fa-spin"></i> {{loading ? "" : (format ? (format | translate:entity) : entity[property])}}',
			link: function (scope) {
				if (scope.object && typeof scope.object === 'object') {
					scope.entity = scope.object;
				} else {
					scope.loading = true;
					var serviceName = scope.type[0].toUpperCase() + scope.type.substring(1) + 'Service',
						service = $injector.get(serviceName),
						promise = service.get({}, {guid: scope.object});
					promise.then(function (entity) {
						scope.entity = entity;
					});
					promise.finally(function () {
						delete scope.loading;
					})
				}
			}
		}
	}

	RenderObject.$inject = [
		'$injector'
	];

	angular
		.module('angular-utilities')
		.directive('renderObject', RenderObject);
})();