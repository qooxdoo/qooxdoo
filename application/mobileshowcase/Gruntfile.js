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
      "APPLICATION" : "mobileshowcase",
      "LOCALES": ["en"],
      "QOOXDOO_PATH" : "../..",
      "QXTHEME": "",
      "THEME": "indigo",  // possible values: "indigo","flat"
      "ENVIRONMENT": {
        "qx.application": "<%= common.APPLICATION %>.Application",
        "qx.revision":"",
        "qx.theme": "<%= common.THEME %>",
        "qx.version":"<%= common.QOOXDOO_VERSION %>"
      },
      "MOBILE_RESOURCE_PATH": "source/resource/<%= common.APPLICATION %>"
    },

    clean: {
      build: ["./build-<%= common.THEME %>"]
    },

    source: {
      options: {
        "=includes": ["<%= common.APPLICATION_MAIN_CLASS %>"],
        "=loaderTemplate": "<%= common.QOOXDOO_PATH %>/tool/data/generator/mobile.loader.tmpl.js",
        addCss: ["./resource/<%= common.APPLICATION %>/css/indigo.css"]
      }
    },

    build: {
      options: {
        "=includes": ["<%= common.APPLICATION_MAIN_CLASS %>"],
        "=loaderTemplate": "<%= common.QOOXDOO_PATH %>/tool/data/generator/mobile.loader.tmpl.js",
        addCss: ["./resource/<%= common.APPLICATION %>/css/indigo.css"],
        buildPath: "./build-<%= common.THEME %>"
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
