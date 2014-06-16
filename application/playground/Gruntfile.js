// requires
var util = require('util');
var qx = require("../../tool/grunt");

// grunt
module.exports = function(grunt) {
  var config = {
    generator_config: {
      let: {
      }
    },

    common: {
      "APPLICATION": "playground",
      "LOCALES": [ "en", "de", "ro", "sv", "cs"],
      "QOOXDOO_PATH": "../..",
      "QXTHEME": "<%= common.APPLICATION %>.theme.Theme",
      "MOBILE_RESOURCE_PATH": "source/resource/<%= common.APPLICATION %>"
    },

    source: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        sourcePath: "<%= common.SOURCE_PATH %>/script",
        locales:  "<%= common.LOCALES %>",
        addCss: ["./resource/<%= common.APPLICATION %>/css/indigo.css"],
        includes: ["<%= common.APPLICATION %>.*", "qx.*"],
        excludes: [
         "qx.test.*",
         "qx.dev.unit.*",
         "qx.dev.FakeServer",  // as this depends on qx.dev.unit classes
         "playground.test.*"
        ],
        environment: {
          "qx.debug" : true,
          "qx.debug.ui.queue" : true,
          "qx.nativeScrollBars" : true,
          "qx.allowUrlSettings" : true,
          "qx.mobile.emulatetouch" : true
        },
        libraries: [
          "<%= common.QOOXDOO_PATH %>/component/library/logpane/Manifest.json",
          "<%= common.QOOXDOO_PATH %>/component/library/versionlabel/Manifest.json"
        ]
      }
    },

    build: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        sourcePath: "<%= common.SOURCE_PATH %>",
        locales:  "<%= common.LOCALES %>",
        addCss: ["./resource/<%= common.APPLICATION %>/css/indigo.css"],
        includes: ["<%= common.APPLICATION %>.*", "qx.*"],
        excludes: [
         "qx.test.*",
         "qx.dev.unit.*",
         "qx.dev.FakeServer",  // as this depends on qx.dev.unit classes
         "playground.test.*"
        ],
        environment: {
          "qx.debug" : true,
          "qx.debug.ui.queue" : true,
          "qx.nativeScrollBars" : true,
          "qx.allowUrlSettings" : true,
          "qx.mobile.emulatetouch" : true
        },
        libraries: [
          "<%= common.QOOXDOO_PATH %>/component/library/logpane/Manifest.json",
          "<%= common.QOOXDOO_PATH %>/component/library/versionlabel/Manifest.json"
        ]
      }
    },

    sass: {
      indigo: {
        options: {
          style: 'compressed',
          noCache: true,
          loadPath: ['<%= common.QOOXDOO_PATH %>/framework/source/resource/qx/mobile/scss',
                     '<%= common.QOOXDOO_PATH %>/framework/source/resource/qx/scss']
        },
        files: [{
          expand: true,
          cwd: '<%= common.MOBILE_RESOURCE_PATH %>/scss',
          src: ['*.scss'],
          dest: '<%= common.MOBILE_RESOURCE_PATH %>/css',
          ext: '.css'
        }]
      }
    },
  };

  var mergedConf = qx.config.mergeConfig(config, {"build": "build-base", "source": "source-base"});
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  grunt.loadNpmTasks('grunt-contrib-sass');

  // 'extend' build job
  grunt.task.renameTask('build', 'build-base');
  grunt.task.registerTask(
    'build',
    'Build the playground and compile the stylesheets with Sass.',
    ["build-base", "sass"]
  );

  // 'extend' source job
  grunt.task.renameTask('source', 'source-base');
  grunt.task.registerTask(
    'source',
    'Build the playground and compile the stylesheets with Sass.',
    ["source-base", "sass"]
  );
};
