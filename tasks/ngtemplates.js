(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-angular-templates');
		grunt.config('ngtemplates', {
			'angular-utilities': {
				cwd: 'src',
				src: 'templates/**/*.html',
				dest: 'src/templates/angular-utilities.js'
			}
		});
	};

})(module);