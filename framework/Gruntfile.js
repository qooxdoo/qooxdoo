// requires
var util = require('util');
var qx = require("../tool/grunt");

// grunt
module.exports = function(grunt) {
  var config = {
    generator_config: {
      let: {
      }
    },

    common: {
      "APPLICATION" : "qooxdoo",
      "LOCALES": ["en"],
      "QOOXDOO_PATH" : "../",
    }
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);
};
