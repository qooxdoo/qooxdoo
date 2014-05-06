// requires
var util = require('util');
var qx = require("${REL_QOOXDOO_PATH}/tool/grunt");

// grunt
module.exports = function(grunt) {
  var config = {

    generator_config: {
      let: {
      }
    },

    common: {
      "APPLICATION" : "${Namespace}",
      "QOOXDOO_PATH" : "${REL_QOOXDOO_PATH}",
      "LOCALES": ["en"],
      "QXTHEME": "${Namespace}.theme.Theme"
    }

    /*
    myTask: {
      options: {},
      myTarget: {
        options: {}
      }
    }
    */
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  // grunt.loadNpmTasks('grunt-my-plugin');
};
