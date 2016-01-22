module.exports = function (grunt) {

	// require `load-grunt-tasks`, which loads all grunt tasks defined in package.json
	require('load-grunt-tasks')(grunt);
	// load tasks defined in the `/tasks` folder
	grunt.loadTasks('tasks');

	// Function to load the options for each grunt module
	var loadConfig = function (path) {
		var glob = require('glob');
		var object = {};
		var key;

		glob.sync('*', {cwd: path}).forEach(function(option) {
			key = option.replace(/\.js$/,'');
			object[key] = require(path + option);
		});

		return object;
	};

	var config = {
		pkg: grunt.file.readJSON('package.json'),
		env: process.env
	};

	grunt.util._.extend(config, loadConfig('./tasks/options/'));

	grunt.initConfig(config);

};
