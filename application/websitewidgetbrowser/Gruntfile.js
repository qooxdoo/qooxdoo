// global conf
var _qx = {
  sdkPath: "../..",
  generatorJobs: [
    ["api", "Create a qx.Website Apiviewer"],
    ["api-data", "Create API data for the qx.Website API viewer"],
    ["build", ""],
    ["build-min", ""],
    ["build-module-all", ""],
    ["build-module-all-min", ""],
    ["clean", "remove local generated files"],
    ["distclean", "remove local generated files and global cache"],
    ["log-deps", ""],
    ["source", ""],
    ["test", ""],
    ["test-module", ""],
    ["test-source", ""],
    ["validate-config", "validates the 'config.json' itself - if jobname arg is given checks dedicated job only"]
  ]
};

// requires
var qxConf = require(_qx.sdkPath + '/tool/grunt/config/application.js');
var qxTasks = require(_qx.sdkPath + '/tool/grunt/tasks/tasks.js');

// grunt
module.exports = function(grunt) {
  var config = {
    qx: {
      "let" : {
        "APPLICATION": "library",
        "QOOXDOO_PATH": _qx.sdkPath,
        "QOOXDOO_VERSION": "3.1",
        "CACHE": "<%= grunt_qx.TMPDIR %>/qx<%= qx.let.QOOXDOO_VERSION %>/cache"
      }
    },

    sass: {
      indigo: {
        options: {
          style: 'compressed'
        },
        files: {
          'script/indigo.css': _qx.sdkPath + '/framework/source/resource/qx/website/scss/indigo.scss'
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



  var mergedConf = qxConf.mergeConfig(config);
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt, _qx.generatorJobs);

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
  grunt.task.renameTask('source', 'generate-source');
  grunt.task.registerTask(
    'source',
    'Concat the samples and generate the API.',
    ["generate-source", "sass:indigo", "notify:source"]
  );
};
