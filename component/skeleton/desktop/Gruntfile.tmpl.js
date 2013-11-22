// global conf
var common = {

  QOOXDOO_VERSION : "${QOOXDOO_VERSION}",
  QOOXDOO_PATH: "${REL_QOOXDOO_PATH}",
  generatorJobs: ${JOBS_AND_DESCS}
  
};

// requires
var qxConf = require(common.QOOXDOO_PATH + '/tool/grunt/config/application.js');
var qxTasks = require(common.QOOXDOO_PATH + '/tool/grunt/tasks/tasks.js');

// grunt
module.exports = function(grunt) {
  var config = {

    generator_config : {
      let : { }
    },

    common : common,

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

  qxTasks.registerTasks(grunt, common.generatorJobs);

  grunt.loadNpmTasks('grunt-contrib-clean');
};
