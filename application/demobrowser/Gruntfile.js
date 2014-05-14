// requires
require('shelljs/global');

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
      "APPLICATION" : "demobrowser",
      "LOCALES": ["en"],
      "QOOXDOO_PATH" : "../..",
      "QXTHEME": "<%= common.APPLICATION %>.theme.Theme"
    }
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  // 'extend' build job
  grunt.task.renameTask('build-data', 'generate-build-data');
  grunt.task.registerTask(
    'build-data',
    'creates a Json index of all demos (demodata.js), for Demobrowser\'s navigation pane.',
    function () {
      exec('node tool/generate-data.js build/script build/demo');
    }
  );

  // 'extend' source job
  grunt.task.renameTask('source-data', 'generate-source-data');
  grunt.task.registerTask(
    'source-data',
    'creates a Json index of all demos (demodata.js), for Demobrowser\'s navigation pane',
    function () {
      exec('node tool/generate-data.js build/script build/demo');
    }
  );
};
