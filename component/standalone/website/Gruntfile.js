// global conf
var _qx = {
  sdkPath: "../../..",
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
var qxConf = require(_qx.sdkPath + '/tool/data/grunt/config/application.js');
var qxTasks = require(_qx.sdkPath + '/tool/data/grunt/tasks/tasks.js');

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

    concat: {
      options: {
        separator: ';'
      },
      samples : {
        src: ['api/samples/*.js'],
        dest: 'api/script/samples.js'
      }
    }
  };



  var mergedConf = qxConf.mergeConfig(config);
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt, _qx.generatorJobs);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // 'extend' API job
  grunt.task.renameTask('api', 'generate-api');
  grunt.task.registerTask(
    'api',
    'Concat the samples and generate the API.',
    ["concat:samples", "generate-api"]
  );
};
