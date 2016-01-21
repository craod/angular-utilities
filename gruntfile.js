(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadTasks('tasks');
		grunt.registerTask('compile', ['ngtemplates', 'concat', 'uglify', 'compass', 'cssmin', 'clean']);
	};

})(module);