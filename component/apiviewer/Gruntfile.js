// global conf
var common = {
  QOOXDOO_VERSION: "3.5",
  QOOXDOO_PATH: "../.."
};

// requires
var qxConf = require(common.QOOXDOO_PATH + '/tool/grunt/config/application.js');
var qxTasks = require(common.QOOXDOO_PATH + '/tool/grunt/tasks/tasks.js');

// grunt
module.exports = function (grunt) {
  var config = {
    qx: {
      let: {
      }
    },
    common: common
  };

  var mergedConf = qxConf.mergeConfig(config);
  grunt.initConfig(mergedConf);

  qxTasks.registerTasks(grunt);
};