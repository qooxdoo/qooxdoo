/*
 * grunt-qx-build
 */

'use strict';

// native
var os = require('os');

var common = {
  "APPLICATION" : "myapp",
  "QOOXDOO_PATH": "../../../..",
  "QOOXDOO_VERSION": "4.1",
  "LOCALES": ["en", "de"],
  "QXTHEME": "<%= common.APPLICATION %>.theme.Theme",
  "QXICONTHEME": ["Tango"],
  "ROOT": ".",
  "TMPDIR": os.tmpdir(),
  "APPLICATION_MAIN_CLASS" : "<%= common.APPLICATION %>.Application",
  "SOURCE_PATH": "<%= common.ROOT %>/test/data/myapp/source",
  "BUILD_PATH": "<%= common.ROOT %>/test/data/myapp/build",
  "CACHE": "<%= common.TMPDIR %>/qx<%= common.QOOXDOO_VERSION %>/cache",
  "ENVIRONMENT": {
    // base.json: common
    "qx.application": "<%= common.APPLICATION %>.Application",
    "qx.revision":"",
    "qx.theme": "<%= common.APPLICATION %>.theme.Theme",
    "qx.version":"3.6",
    // base.json: build-script
    "qx.debug" : false,
    "qx.debug.databinding" : false,
    "qx.debug.dispose" : false,
    "qx.debug.ui.queue" : false,
    "qx.debug.io" : false
  }
};

module.exports = function(grunt) {

  grunt.initConfig({

    common: common,

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
      options: {
        force: true
      },
      tests: ['tmp'],
      cache: ["<%= common.CACHE %>"]
    },

    build: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        qxIconTheme: "<%= common.QXICONTHEME %>",
        locales:  "<%= common.LOCALES %>",
        sourcePath: "<%= common.SOURCE_PATH %>",
        buildPath: "<%= common.BUILD_PATH %>",
        cachePath: "<%= common.CACHE %>",
        loaderTemplate: "<%= common.QOOXDOO_PATH %>/tool/data/generator/loader.tmpl.js",
        environment: common.ENVIRONMENT,
        includes: ["<%= common.APPLICATION_MAIN_CLASS %>", "<%= common.QXTHEME %>"],
        excludes: [],
        libraries: [
          "<%= common.QOOXDOO_PATH %>/framework/Manifest.json",
          "<%= common.ROOT %>/test/data/myapp/Manifest.json"
        ]
      },
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
  grunt.registerTask('test', ['clean', 'build', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
