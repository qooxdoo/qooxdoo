/*
 * grunt-qx-source
 */

'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    common: {
      "APPLICATION" : "myapp",
      "QOOXDOO_PATH": "../../../..",
      "LOCALES": ["en"],
      "QXTHEME": "<%= common.APPLICATION %>.theme.Theme",
      "ROOT": ".",
      "APPLICATION_MAIN_CLASS" : "<%= common.APPLICATION %>.Application",
      "SOURCE_PATH": "<%= common.ROOT %>/test/data/myapp/source/script",
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    clean: {
      tests: ['tmp'],
    },

    source: {
      default_options: {
        options: {
          appName: "<%= common.APPLICATION %>",
          sourcePath: "<%= common.SOURCE_PATH %>",
          locales:  "<%= common.LOCALES %>",
          includes: ["<%= common.APPLICATION_MAIN_CLASS %>", "<%= common.QXTHEME %>"],
          libraries: [
            "<%= common.QOOXDOO_PATH %>/framework/Manifest.json",
            "<%= common.ROOT %>/test/data/myapp/Manifest.json"
          ]
        },
      },
      /*
      custom_options: {
        options: {
        },
      },
      */
    },

    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'source', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
