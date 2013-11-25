// global conf
var common = {
  QOOXDOO_PATH : "../../..",
  QOOXDOO_VERSION : "3.1",
  APPLICATION: "library",
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
var qxConf = require(common.QOOXDOO_PATH + '/tool/grunt/config/application.js');
var qxTasks = require(common.QOOXDOO_PATH + '/tool/grunt/tasks/tasks.js');

// grunt
module.exports = function(grunt) {

  var config = {
    generator_config: {
      let : {
      }
    },

    common : common,

    concat: {
      options: {
        separator: ';'
      },
      samples : {
        src: ['api/samples/*.js'],
        dest: 'api/script/samples.js'
      }
    },

    watch: {
      samples: {
        files: ['api/samples/*.js'],
        tasks: ['concat:samples', "notify:samples"]
      },
      "api-data": {
        files: ['../../../framework/source/**/*.js'],
        tasks: ['api-data', "notify:apidata"]
      }
    },

    sass: {
      indigo: {
        options: {
          style: 'compressed'
        },
        files: {
          'script/indigo.css': common.QOOXDOO_PATH + '/framework/source/resource/qx/website/scss/indigo.scss'
        }
      }
    },

    notify: {
      samples: {
        options: {
          message: 'Samples build and saved.'
        }
      },
      apidata: {
        options: {
          message: 'API-Data generated.'
        }
      },
      api: {
        options: {
          message: 'API-Viewer generated.'
        }
      }
    }
  };



  var mergedConf = qxConf.mergeConfig(config);
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt, common.generatorJobs);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // 'extend' API job
  grunt.task.renameTask('api', 'generate-api');
  grunt.task.registerTask(
    'api',
    'Concat the samples and generate the API.',
    ["concat:samples", "generate-api", "sass:indigo", "notify:api"]
  );
};
