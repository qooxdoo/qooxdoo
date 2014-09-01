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
      "APPLICATION" : "websitewidgetbrowser",
      "LOCALES": ["en"],
      "QOOXDOO_PATH" : "../..",
      "QXTHEME": "<%= common.APPLICATION %>.theme.Theme"
    },

    sass: {
      indigo: {
        options: {
          style: 'compressed'
        },
        files: {
          'script/indigo.css': '<%= common.QOOXDOO_PATH %>/framework/source/resource/qx/website/scss/indigo.scss'
        }
      }
    },

    notify: {
      build: {
        options: {
          message: 'Website Widget Browser (build version) generated.'
        }
      },
      source: {
        options: {
          message: 'Website Widget Browser (source version) generated.'
        }
      }
    }
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-sass');


  // 'extend' build job
  grunt.task.renameTask('build', 'generate-build');
  grunt.task.registerTask(
    'build',
    'Concat the samples and generate the API.',
    ["build-min", "sass:indigo", "notify:build"]
  );

  // 'extend' source job
  grunt.task.renameTask('source', 'temp');
  grunt.task.registerTask(
    'source',
    'Concat the samples and generate the API.',
    ["generate:source", "sass:indigo", "notify:source"]
  );
};
