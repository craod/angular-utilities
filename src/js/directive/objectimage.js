(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name ObjectImage
	 * @description
	 * Load an object image in the given size
	 */
	function ObjectImage (Resource) {
		return {
			restrict: 'E',
			scope: {
				object: '=',
				width: '@?',
				height: '@?',
				mode: '@?',
				class: '@?',
				type: '@?'
			},
			templateUrl: 'templates/objectimage.html',
			link: function (scope) {
				scope.resource = Resource;
			}
		}
	}

	ObjectImage.$inject = [
		'Resource'
	];

	angular
		.module('angular-utilities')
		.directive('objectImage', ObjectImage);
})();