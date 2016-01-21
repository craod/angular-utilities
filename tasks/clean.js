(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.config('clean', {
			options: {
				force: true
			},
			templates: ['src/templates/**/*.js']
		});
	};

})(module);