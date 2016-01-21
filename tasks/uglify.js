(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.config('uglify', {
			bundle: {
				files: [{
					src: ['dist/angular-utilities.js'],
					dest: 'dist/angular-utilities.min.js'
				}]
			}
		});
	};

})(module);