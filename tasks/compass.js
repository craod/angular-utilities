(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-compass');
		grunt.config('compass', {
			main: {
				options: {
					sassDir: 'src/css',
					cssDir: 'dist',
					force: true
				}
			}
		});
	};

})(module);