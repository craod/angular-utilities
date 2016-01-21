(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadTasks('tasks');
		grunt.registerTask('compile', ['concat', 'uglify']);
	};

})(module);