(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-cssmin');
		grunt.config('cssmin', {
			dist: {
				files: [{
					src: ['dist/angular-utilities.css'],
					dest: 'dist/angular-utilities.min.css'
				}]
			}
		});
	};

})(module);