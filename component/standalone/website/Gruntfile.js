// global conf
var common = {
  QOOXDOO_PATH : "../../..",
  QOOXDOO_VERSION : "3.5.2",
  APPLICATION: "library"
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
          message: 'Samples built and saved.'
        }
      },
      apidata: {
        options: {
          message: 'API data generated.'
        }
      },
      api: {
        options: {
          message: 'API viewer generated.'
        }
      },
      test: {
        options: {
          message: 'Test Runner generated.'
        }
      },
      source: {
        options: {
          message: 'qx.Website source version generated.'
        }
      },
      build: {
        options: {
          message: 'qx.Website unminified build version generated.'
        }
      }
    }
  };

  var mergedConf = qxConf.mergeConfig(config);
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt);

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

  // 'extend' test jobs
  grunt.task.renameTask('test', 'generate-test');
  grunt.task.registerTask(
    'test',
    'Generate the Indigo CSS and the Test Runner (using a minified version of qx.Website).',
    ["generate-test", "sass:indigo", "notify:test"]
  );

  grunt.task.renameTask('test-source', 'generate-test-source');
  grunt.task.registerTask(
    'test-source',
    'Generate the Indigo CSS and the Test Runner (using a source version of qx.Website).',
    ["generate-test-source", "sass:indigo", "notify:test"]
  );

  grunt.task.renameTask('test-module', 'generate-test-module');
  grunt.task.registerTask(
    'test-module',
    'Generate the Indigo CSS and the Test Runner (using a modular version of qx.Website).',
    ["generate-test-module", "sass:indigo", "notify:test"]
  );

  // 'extend' source job
  grunt.task.renameTask('source', 'generate-source');
  grunt.task.registerTask(
    'source',
    'Generate the source version of qx.Website and the widget CSS',
    ["generate-source", "sass:indigo", "notify:source"]
  );

  // 'extend' build job
  grunt.task.renameTask('build', 'generate-build');
  grunt.task.registerTask(
    'build',
    'Generate the build version of qx.Website and the widget CSS',
    ["generate-build", "sass:indigo", "notify:build"]
  );
};
