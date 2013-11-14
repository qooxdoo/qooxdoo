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
        "CACHE": "<%= grunt_qx.TMPDIR %>/qx<%= qx.let.QOOXDOO_VERSION %>/cache",
      }
    },
    /*
    myTask: {
      options: {},
      myTarget: {
        options: {}
      }
    }
    */
  };

  var mergedConf = qxConf.mergeConfig(config);
  // console.log(mergedConf);
  // process.exit();
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt, _qx.generatorJobs);

  grunt.loadNpmTasks('grunt-contrib-clean');
};
