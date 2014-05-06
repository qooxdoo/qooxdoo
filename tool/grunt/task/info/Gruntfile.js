/*
 * grunt-qx-info
 */
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    info: {
      options: {
        qxPath: "test/sample/qx",
        cachePaths: {
          compile: "test/sample/tmp/",
          downloads: "test/sample/tmp/downloads"
        }
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Run this plugin's task(s), then test the result.
  grunt.registerTask('test', ['info']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
