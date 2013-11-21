// global conf
var _qx = {
  sdkPath: "${REL_QOOXDOO_PATH}",
  generatorJobs: ${JOBS_AND_DESCS}
};

// requires
var qxConf = require(_qx.sdkPath + '/tool/grunt/config/application.js');
var qxTasks = require(_qx.sdkPath + '/tool/grunt/tasks/tasks.js');

// grunt
module.exports = function(grunt) {
  var config = {
    qx: {
      "APPLICATION": "${Namespace}",
      "QOOXDOO_PATH": "${REL_QOOXDOO_PATH}",
      "QOOXDOO_VERSION": "${QOOXDOO_VERSION}",
      "QXTHEME": "${Namespace}.theme.Theme",
      "API_EXCLUDE": ["qx.test.*", "<%= qx.APPLICATION %>.theme.*", "<%= qx.APPLICATION %>.test.*", "<%= qx.APPLICATION %>.simulation.*"],
      "LOCALES": [ "en" ],
      "CACHE": "${Cache}",
      "ROOT": "."
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
