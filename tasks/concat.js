(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.config('concat', {
			javascript: {
				src: ['src/js/**/*.js', 'src/templates/**/*.js'],
				dest: 'dist/angular-utilities.js',
				force: true
			}
		});
	};

})(module);